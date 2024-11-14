import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import FormBounty from '@/components/global/FormBounty';
import GameButton from '@/components/global/GameButton';
import ButtonCTA from '@/components/ui/ButtonCTA';
import { toast } from 'react-toastify';

export default function CreateBounty() {
  const [showForm, setShowForm] = useState(false);
  const account = useAccount();

  return (
    <div className='fixed bottom-8 z-40 w-full flex justify-center items-center lg:flex-col'>
      {!showForm && (
        <div
          className='absolute button bottom-10 flex cursor-pointer flex-col items-center justify-center'
          onClick={() => {
            if (account.isConnected) {
              setShowForm(true);
              return;
            }
            toast.error('Please connect your wallet');
          }}
        >
          <GameButton />
          <ButtonCTA>create bounty</ButtonCTA>
        </div>
      )}
      <FormBounty open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
