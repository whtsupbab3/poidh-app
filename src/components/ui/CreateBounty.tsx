import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Form from '@/components/global/Form';
import GameButton from '@/components/global/GameButton';
import ButtonCTA from '@/components/ui/ButtonCTA';
import { toast } from 'react-toastify';
import { CloseIcon } from '@/components/global/Icons';

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

      {showForm && (
        <div className='w-auto relative bottom-40'>
          <button
            onClick={() => setShowForm(false)}
            className='absolute right-0 border border-[#D1ECFF] backdrop-blur-sm bg-white/30 rounded-full p-2'
          >
            <CloseIcon />
          </button>
          <Form />
        </div>
      )}
    </div>
  );
}
