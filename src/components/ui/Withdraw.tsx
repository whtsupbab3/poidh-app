import abi from '@/constant/abi/abi';
import { useGetChain } from '@/hooks/useGetChain';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'react-toastify';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';

export default function Withdraw({ bountyId }: { bountyId: string }) {
  const chain = useGetChain();
  const account = useAccount();
  const writeContract = useWriteContract({});
  const switctChain = useSwitchChain();

  const withdrawFromOpenBountyMutation = useMutation({
    mutationFn: async (bountyId: bigint) => {
      if (chain.id !== account.chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        __mode: 'prepared',
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: 'withdrawFromOpenBounty',
        args: [bountyId],
      });
    },
  });

  return (
    <div className=' py-12 w-fit '>
      <button
        className='border border-white rounded-full px-5 py-2  backdrop-blur-sm bg-white/30 '
        onClick={() => {
          if (account.isConnected) {
            withdrawFromOpenBountyMutation.mutate(BigInt(bountyId));
          } else {
            toast.error('Please fill in all fields and connect wallet');
          }
        }}
      >
        {' '}
        withdraw{' '}
      </button>
    </div>
  );
}
