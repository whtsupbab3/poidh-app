import abi from '@/constant/abi/abi';
import { useGetChain } from '@/hooks/useGetChain';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';

export default function FormJoinBounty({ bountyId }: { bountyId: string }) {
  const [amount, setAmount] = useState<string>('');
  const account = useAccount();
  const writeContract = useWriteContract({});
  const chain = useGetChain();
  const switctChain = useSwitchChain();

  const bountyMutation = useMutation({
    mutationFn: async (bountyId: bigint) => {
      if (chain.id !== account.chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        __mode: 'prepared',
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        value: BigInt(parseEther(amount)),
        functionName: 'joinOpenBounty',
        args: [bountyId],
        chainId: chain.id,
      });
    },
  });

  useEffect(() => {
    if (bountyMutation.isSuccess) {
      toast.success('Bounty joined successfully');
    }
    if (bountyMutation.isError) {
      toast.error('Failed to join bounty');
    }
  }, [bountyMutation.isSuccess, bountyMutation.isError]);

  return (
    <>
      <div className='flex w-fit flex-col '>
        <span>reward</span>
        <input
          type='number'
          placeholder=''
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4'
        />
        <button
          className={`border border-white rounded-full px-5 py-2  backdrop-blur-sm bg-white/30 ${
            account.isDisconnected ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => {
            if (account.isConnected) {
              bountyMutation.mutate(BigInt(bountyId));
            } else {
              toast.error('Please connect wallet to continue');
            }
          }}
        >
          join bounty
        </button>
      </div>
    </>
  );
}
