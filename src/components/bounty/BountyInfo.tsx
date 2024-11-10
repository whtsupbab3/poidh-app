import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { useGetChain } from '@/hooks/useGetChain';
import BountyMultiplayer from '@/components/bounty/BountyMultiplayer';
import { trpc, trpcClient } from '@/trpc/client';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import { useMutation } from '@tanstack/react-query';
import DisplayAddress from '@/components/DisplayAddress';
import { formatEther } from 'viem';
import abi from '@/constant/abi/abi';
import Loading from '@/components/global/Loading';

export default function BountyInfo({ bountyId }: { bountyId: string }) {
  const chain = useGetChain();
  const account = useAccount();
  const writeContract = useWriteContract({});
  const switctChain = useSwitchChain();

  const [status, setStatus] = useState<string>('');

  const bounty = trpc.bounty.useQuery(
    {
      id: bountyId,
      chainId: chain.id.toString(),
    },
    { enabled: !!bountyId }
  );

  const cancelMutation = useMutation({
    mutationFn: async (bountyId: bigint) => {
      const chainId = await account.connector?.getChainId();
      if (chain.id !== chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }

      setStatus('Waiting approval');
      await writeContract.writeContractAsync({
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: bounty.data!.isMultiplayer
          ? 'cancelOpenBounty'
          : 'cancelSoloBounty',
        args: [bountyId],
        chainId: chain.id,
      });

      for (let i = 0; i < 60; i++) {
        setStatus('Indexing ' + i + 's');
        const canceled = await trpcClient.isBountyCanceled.query({
          id: bountyId.toString(),
          chainId: chain.id.toString(),
        });
        if (canceled) {
          bounty.refetch();
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 1_000));
      }
      throw new Error('Failed to cancel bounty');
    },
    onSuccess: () => {
      toast.success('Bounty canceled');
    },
    onError: (error) => {
      toast.error('Failed to cancel bounty: ' + error.message);
    },
    onSettled: () => {
      setStatus('');
    },
  });

  if (!bounty.data) {
    return null;
  }

  return (
    <>
      <Loading open={cancelMutation.isPending} status={status} />
      <div className='flex pt-20 flex-col justify-between lg:flex-row'>
        <div className='flex flex-col  lg:w-[50%]'>
          <p className='max-w-[30ch] overflow-hidden text-ellipsis text-2xl lg:text-4xl text-bold normal-case'>
            {bounty.data.title}
          </p>
          <p className='mt-5 normal-case'>{bounty.data.description}</p>
          <p className='mt-5 normal-case break-all'>
            bounty issuer:{' '}
            <Link
              href={`/${chain.slug}/account/${bounty.data.issuer}`}
              className='hover:text-gray-200'
            >
              <DisplayAddress address={bounty.data.issuer} chain={chain} />
            </Link>
          </p>
          <p className='mt-5 font-bold'>
            {`${formatEther(BigInt(bounty.data.amount))} ${chain.currency}`}
          </p>
        </div>
        <div className='flex flex-col space-between'>
          <div>
            {bounty.data.inProgress &&
              account.isConnected &&
              account.address === bounty.data.issuer && (
                <button
                  onClick={() => {
                    if (account.isConnected) {
                      cancelMutation.mutate(BigInt(bountyId));
                    } else {
                      toast.error('Please connect wallet to continue');
                    }
                  }}
                  disabled={!bounty.data.inProgress}
                  className={`border border-[#F15E5F] rounded-md py-2 px-5 mt-5 ${
                    !bounty.data.inProgress
                      ? 'bg-[#F15E5F] text-white'
                      : 'hover:bg-red-400 hover:text-white'
                  } `}
                >
                  {bounty.data.isCanceled
                    ? 'canceled'
                    : account.address === bounty.data.issuer
                    ? 'cancel'
                    : !bounty.data.inProgress
                    ? 'accepted'
                    : null}
                </button>
              )}
          </div>
        </div>
      </div>
      {bounty.data.isMultiplayer && (
        <BountyMultiplayer
          chain={chain}
          bountyId={bountyId}
          inProgress={Boolean(bounty.data.inProgress)}
          issuer={bounty.data.issuer}
        />
      )}
    </>
  );
}
