import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { PieChart } from '@mui/x-charts/PieChart';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { formatEther } from 'viem';

import { useGetChain } from '@/hooks/useGetChain';
import { bountyVotingTracker, resolveVote, voteClaim } from '@/utils/web3';

export default function Voting({ bountyId }: { bountyId: string }) {
  const { primaryWallet } = useDynamicContext();
  const chain = useGetChain();
  const [voting, setVoting] = useState<{
    yes: string;
    no: string;
    deadline: string;
  } | null>(null);

  useEffect(() => {
    bountyVotingTracker({ id: bountyId, chainName: chain.chainPathName }).then(
      setVoting
    );
  }, [bountyId]);

  const voteHandler = async (vote: boolean) => {
    if (!bountyId || !primaryWallet) {
      toast.error('Please connect wallet');
      return;
    }
    try {
      await voteClaim({
        vote,
        wallet: primaryWallet,
        bountyId,
        chainName: chain.chainPathName,
      });
      toast.success('Vote made successfully!');
    } catch (error: any) {
      if (error.info?.error?.code !== 4001) {
        toast.error('Failed to vote');
      }
    }
  };

  const resolveVoteHandler = async () => {
    if (!bountyId || !primaryWallet) {
      toast.error('Please connect wallet');
      return;
    }
    try {
      await resolveVote({
        wallet: primaryWallet,
        bountyId,
        chainName: chain.chainPathName,
      });
      toast.success('Vote resolved successfully!');
    } catch (error: any) {
      if (error.info?.error?.code !== 4001) {
        toast.error('Failed to resolve vote');
      }
    }
  };

  return (
    <div className='col-span-12 lg:col-span-3 p-5 lg:p-0 '>
      {voting ? (
        <>
          <div className='flex items-center mb-5'>
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: Number(formatEther(BigInt(voting.yes || 0))),
                      label: 'Yes',
                    },
                    {
                      id: 1,
                      value: Number(formatEther(BigInt(voting.no || 0))),
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
            Yes votes: {formatEther(BigInt(voting.yes || 0))}
            {chain.currency}
          </div>
          <div>
            No votes: {formatEther(BigInt(voting.no || 0))}
            {chain.currency}
          </div>

          <div className='flex flex-row gap-x-5 '>
            <button
              className='border mt-5 border-white rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
              onClick={() => voteHandler(true)}
            >
              yes
            </button>
            <button
              className='border mt-5 border-white rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
              onClick={() => voteHandler(false)}
            >
              no
            </button>
            <button
              className='border mt-5 border-white rounded-full px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
              onClick={resolveVoteHandler}
            >
              resolve vote
            </button>
          </div>

          <div className='mt-5 '>
            Deadline:{' '}
            {new Date(parseInt(voting.deadline ?? '0') * 1000).toLocaleString()}
          </div>
        </>
      ) : (
        <div>Loading voting data...</div>
      )}
    </div>
  );
}
