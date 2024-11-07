import abi from '@/constant/abi/abi';
import { useGetChain } from '@/hooks/useGetChain';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';
import { useAccount, useSwitchChain, useWriteContract } from 'wagmi';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { cn } from '@/utils';

export default function FormJoinBounty({
  bountyId,
  open,
  onClose,
}: {
  bountyId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState<string>('');

  const account = useAccount();
  const writeContract = useWriteContract({});
  const chain = useGetChain();
  const switchChain = useSwitchChain();

  const bountyMutation = useMutation({
    mutationFn: async (bountyId: bigint) => {
      if (chain.id !== account.chainId) {
        await switchChain.switchChainAsync({ chainId: chain.id });
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

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          onClose();
          setAmount('');
        }}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          className: 'bg-poidhBlue/80',
          style: {
            borderRadius: '10px',
            color: 'white',
            border: '1px solid #D1ECFF',
          },
        }}
      >
        <DialogTitle>Join Bounty</DialogTitle>
        <DialogContent>
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            width='100%'
          >
            <Typography variant='subtitle1' gutterBottom>
              Reward
            </Typography>
            <input
              type='number'
              className='border bg-transparent border-[#D1ECFF] py-2 px-2 rounded-md mb-4 w-full placeholder:text-slate-400'
              onChange={handleAmountChange}
              placeholder={`enter amount in ${chain.currency}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            className={cn(
              'w-full rounded-full lowercase bg-[#F15E5F] hover:bg-red-400 text-white',
              !amount && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!amount}
            onClick={() => {
              if (account.isConnected) {
                bountyMutation.mutate(BigInt(bountyId));
              } else {
                toast.error('Please connect wallet to continue');
              }
            }}
          >
            join bounty
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
