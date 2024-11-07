import { Box, CircularProgress, Switch } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import GameButton from '@/components/global/GameButton';
import { InfoIcon } from '@/components/global/Icons';
import ButtonCTA from '@/components/ui/ButtonCTA';
import { useGetChain } from '@/hooks/useGetChain';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import abi from '@/constant/abi/abi';
import { parseEther } from 'viem';
import { useMutation } from '@tanstack/react-query';

export default function Form() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isSoloBounty, setIsSoloBounty] = useState(true);
  const chain = useGetChain();
  const writeContract = useWriteContract({});
  const account = useAccount();
  const switctChain = useSwitchChain();

  const createBountyMutations = useMutation({
    mutationFn: async () => {
      if (chain.id !== account.chainId) {
        await switctChain.switchChainAsync({ chainId: chain.id });
      }
      await writeContract.writeContractAsync({
        __mode: 'prepared',
        abi,
        address: chain.contracts.mainContract as `0x${string}`,
        functionName: isSoloBounty ? 'createSoloBounty' : 'createOpenBounty',
        value: BigInt(parseEther(amount)),
        args: [name, description],
        chainId: chain.id,
      });
    },
  });

  useEffect(() => {
    if (createBountyMutations.isSuccess) {
      toast.success('Bounty created successfully');
    }
    if (createBountyMutations.isError) {
      toast.error('Failed to create bounty');
    }
  }, [createBountyMutations.isSuccess, createBountyMutations.isError]);

  return (
    <div className='mt-10 flex text-left flex-col text-white rounded-[30px] border border-[#D1ECFF] p-5 w-full lg:min-w-[400px] justify-center backdrop-blur-sm bg-poidhBlue/60'>
      <span>title</span>
      <input
        type='text'
        placeholder=''
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4'
      />
      <span>description</span>
      <textarea
        rows={3}
        placeholder=''
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4 max-h-28'
      ></textarea>

      <span>reward</span>
      <input
        type='number'
        placeholder={`amount in ${chain.currency}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4'
      />
      <div className='flex text-balance gap-2 text-xs mb-2 items-center'>
        <InfoIcon width={18} height={18} /> a 2.5% fee is deducted from
        completed bounties
      </div>

      <div className='flex items-center justify-start gap-2'>
        <span>{isSoloBounty ? 'Solo Bounty' : 'Open Bounty'}</span>
        <Switch
          checked={isSoloBounty}
          onChange={() => setIsSoloBounty(!isSoloBounty)}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </div>
      <div className=' text-xs'>
        <span className='flex gap-2 items-center max-w-md '>
          <InfoIcon width={18} height={18} />
          {isSoloBounty
            ? 'you are the sole bounty contributor'
            : 'users can add additional funds to your bounty'}
        </span>
      </div>

      {createBountyMutations.isPending ? (
        <Box className='flex justify-center items-center mt-5'>
          <CircularProgress />
        </Box>
      ) : (
        <button
          className={`flex flex-row items-center justify-center ${
            account.isDisconnected ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => {
            if (account.isConnected && name && description && amount) {
              createBountyMutations.mutate();
            } else {
              toast.error(
                'Please fill in all fields and check wallet connection.'
              );
            }
          }}
          disabled={account.isDisconnected}
        >
          {createBountyMutations.isPending && (
            <Box sx={{ display: 'flex' }}>
              <CircularProgress />
            </Box>
          )}
          <div className='button'>
            <GameButton />
          </div>
          <ButtonCTA> create bounty </ButtonCTA>
        </button>
      )}
    </div>
  );
}
