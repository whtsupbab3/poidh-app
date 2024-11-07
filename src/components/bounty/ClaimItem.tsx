import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useGetChain } from '@/hooks/useGetChain';
import { CopyIcon } from '@/components/global/Icons';
import { trpc } from '@/trpc/client';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import abi from '@/constant/abi/abi';
import { useMutation } from '@tanstack/react-query';

export default function ClaimItem({
  id,
  title,
  description,
  issuer,
  bountyId,
  accepted,
  isMultiplayer,
  url,
}: {
  id: string;
  title: string;
  description: string;
  issuer: string;
  bountyId: string;
  accepted: boolean;
  isMultiplayer: boolean;
  url: string;
}) {
  const account = useAccount();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const chain = useGetChain();
  const writeContract = useWriteContract({});
  const switctChain = useSwitchChain();

  const bounty = trpc.bounty.useQuery(
    {
      id: bountyId,
      chainId: chain.id.toString(),
    },
    {
      enabled: !!bountyId,
    }
  );

  const fetchImageUrl = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    setImageUrl(data.image);
  };

  useEffect(() => {
    fetchImageUrl(url);
  }, [url]);

  const acceptClaimMutation = useMutation({
    mutationFn: async ({
      bountyId,
      claimId,
    }: {
      bountyId: bigint;
      claimId: bigint;
    }) => {
      if (chain.id !== account.chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        __mode: 'prepared',
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: 'acceptClaim',
        args: [bountyId, claimId],
        chainId: chain.id,
      });
    },
  });

  const submitForVoteMutation = useMutation({
    mutationFn: async ({
      bountyId,
      claimId,
    }: {
      bountyId: bigint;
      claimId: bigint;
    }) => {
      if (chain.id !== account.chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        __mode: 'prepared',
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: 'submitClaimForVote',
        args: [bountyId, claimId],
        chainId: chain.id,
      });
    },
  });

  useEffect(() => {
    if (acceptClaimMutation.isSuccess) {
      toast.success('Claim accepted successfully');
    } else if (acceptClaimMutation.isError) {
      toast.error('Failed to accept claim');
    }
  }, [acceptClaimMutation.isSuccess, acceptClaimMutation.isError]);

  useEffect(() => {
    if (submitForVoteMutation.isSuccess) {
      toast.success('Claim submitted for vote successfully');
    } else if (submitForVoteMutation.isError) {
      toast.error('Failed to submit claim for vote');
    }
  }, [submitForVoteMutation.isSuccess, submitForVoteMutation.isError]);

  return (
    <div className='p-[2px] text-white relative bg-[#F15E5F] border-[#F15E5F] border-2 rounded-xl '>
      <div className='left-5 top-5 absolute  flex flex-col text-white'>
        {isMultiplayer && account.address === issuer && (
          <button
            className='submitForVote cursor-pointer text-[#F15E5F] hover:text-white hover:bg-[#F15E5F] border border-[#F15E5F] rounded-[8px] py-2 px-5  '
            onClick={() => {
              if (account.isConnected) {
                submitForVoteMutation.mutate({
                  bountyId: BigInt(bountyId),
                  claimId: BigInt(id),
                });
              } else {
                toast.error('Please connect wallet to continue');
              }
            }}
          >
            submit for vote
          </button>
        )}

        {bounty.data &&
          bounty.data.inProgress &&
          account.address === bounty.data.issuer && (
            <div
              onClick={() => {
                if (account.isConnected) {
                  acceptClaimMutation.mutate({
                    bountyId: BigInt(bountyId),
                    claimId: BigInt(id),
                  });
                } else {
                  toast.error('Please connect wallet to continue');
                }
              }}
              className='acceptButton cursor-pointer mt-5 text-white hover:bg-[#F15E5F] border border-[#F15E5F] rounded-[8px] py-2 px-5  '
            >
              accept
            </div>
          )}
      </div>

      {accepted && (
        <div className='left-5 top-5 text-white bg-[#F15E5F] border border-[#F15E5F] rounded-[8px] py-2 px-5 absolute '>
          accepted
        </div>
      )}

      <div
        style={{ backgroundImage: `url(${imageUrl})` }}
        className='bg-[#12AAFF] bg-cover bg-center w-full aspect-w-1 aspect-h-1 rounded-[8px] overflow-hidden'
      ></div>
      <div className='p-3'>
        <div className='flex flex-col'>
          <p className='normal-case text-nowrap overflow-ellipsis overflow-hidden'>
            {title}
          </p>
          <p className='normal-case w-full h-20 overflow-y-scroll overflow-x-hidden overflow-hidden'>
            {description}
          </p>
        </div>
        <div className='mt-2 py-2 flex flex-row justify-between text-sm border-t border-dashed'>
          <span className=''>issuer</span>
          <span className='flex flex-row'>
            <Link
              href={`/${chain.slug}/account/${issuer}`}
              className='hover:text-gray-200'
            >
              {issuer.slice(0, 5) + '…' + issuer.slice(-6)}
            </Link>
            <span className='ml-1 text-white'>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(issuer);
                  toast.success('Address copied to clipboard');
                }}
              >
                <CopyIcon width={16} height={16} />
              </button>
            </span>
          </span>
        </div>
        <div>claim id: {id}</div>
      </div>
    </div>
  );
}
