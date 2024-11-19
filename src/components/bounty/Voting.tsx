import { PieChart } from '@mui/x-charts/PieChart';
import React from 'react';
import { toast } from 'react-toastify';
import { formatEther } from 'viem';

import { useGetChain } from '@/hooks/useGetChain';
import { bountyVotingTracker } from '@/utils/web3';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import abi from '@/constant/abi/abi';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function Voting({ bountyId }: { bountyId: string }) {
  const account = useAccount();
  const chain = useGetChain();
  const writeContract = useWriteContract({});
  const switctChain = useSwitchChain();

  const voting = useQuery({
    queryKey: ['bountyVotingTracker', { id: bountyId, chainName: chain.slug }],
    queryFn: () => bountyVotingTracker({ id: bountyId, chainName: chain.slug }),
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      vote,
      bountyId,
    }: {
      vote: boolean;
      bountyId: bigint;
    }) => {
      const chainId = await account.connector?.getChainId();
      if (chain.id !== chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: 'voteClaim',
        args: [bountyId, vote],
        chainId: chain.id,
      });

      voting.refetch();
    },
    onSuccess: () => {
      toast.success('Voted successfully');
    },
    onError: (error) => {
      toast.error('Failed to vote: ' + error.message);
    },
    onSettled: () => {
      voting.refetch();
    },
  });

  const resolveVoteMutation = useMutation({
    mutationFn: async (bountyId: bigint) => {
      const chainId = await account.connector?.getChainId();
      if (chain.id !== chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: 'resolveVote',
        args: [bountyId],
        chainId: chain.id,
      });
    },
    onSuccess: () => {
      toast.success('Vote resolved successfully');
    },
    onError: (error) => {
      toast.error('Failed to resolve vote: ' + error.message);
    },
    onSettled: () => {
      voting.refetch();
    },
  });

  const isVotingInProgress =
    parseInt(voting.data?.deadline ?? '0') * 1000 > Date.now();

  return (
    <div className='col-span-12 lg:col-span-3 p-5 lg:p-0 '>
      {voting.data ? (
        <>
          <div className='flex items-center mb-5'>
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: Number(formatEther(BigInt(voting.data.yes || 0))),
                      label: 'Yes',
                    },
                    {
                      id: 1,
                      value: Number(formatEther(BigInt(voting.data.no || 0))),
                      label: 'No',
                    },
                  ],
                },
              ]}
              width={400}
              height={200}
            />
          </div>

          <div>
            {`Yes votes: ${formatEther(BigInt(voting.data.no || 0))} ${
              chain.currency
            }`}
          </div>
          <div>
            {`No votes: ${formatEther(BigInt(voting.data.no || 0))} ${
              chain.currency
            }`}
          </div>
          <div className='flex flex-row gap-x-5 '>
            {isVotingInProgress ? (
              <>
                <button
                  className='border mt-5 border-white rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
                  onClick={() => {
                    if (account.isConnected) {
                      voteMutation.mutate({
                        vote: true,
                        bountyId: BigInt(bountyId),
                      });
                    } else {
                      toast.error('Please connect wallet to continue');
                    }
                  }}
                >
                  yes
                </button>
                <button
                  className='border mt-5 border-white rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
                  onClick={() => {
                    if (account.isConnected) {
                      voteMutation.mutate({
                        vote: false,
                        bountyId: BigInt(bountyId),
                      });
                    } else {
                      toast.error('Please connect wallet to continue');
                    }
                  }}
                >
                  no
                </button>
              </>
            ) : (
              <button
                className='border mt-5 border-white rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
                onClick={() => {
                  if (account.isConnected) {
                    resolveVoteMutation.mutate(BigInt(bountyId));
                  } else {
                    toast.error('Please connect wallet to continue');
                  }
                }}
              >
                resolve vote
              </button>
            )}
          </div>

          <div className='mt-5 '>
            Deadline:{' '}
            {new Date(
              parseInt(voting.data.deadline ?? '0') * 1000
            ).toLocaleString()}
          </div>
        </>
      ) : (
        <div>Loading voting data...</div>
      )}
    </div>
  );
}
