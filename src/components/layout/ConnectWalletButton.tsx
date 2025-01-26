'use client';
import { WalletIcon, ExpandMoreIcon } from '@/components/global/Icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import React from 'react';

export const ConnectWalletButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');
        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className='border-[#D1ECFF] rounded-lg backdrop-blur-sm bg-white/30 p-2 hover:bg-white/20'
                  >
                    connect
                  </button>
                );
              }
              return (
                <div className='flex gap-2'>
                  <button
                    onClick={openAccountModal}
                    className='border-[#D1ECFF] rounded-lg backdrop-blur-sm bg-white/30 p-1 hover:bg-white/20 flex items-center gap-1 relative'
                  >
                    <div className='relative'>
                      {account.ensAvatar ? (
                        <Image
                          src={account.ensAvatar}
                          className='rounded-lg'
                          alt='User Avatar'
                          width={33}
                          height={33}
                        />
                      ) : (
                        <>
                          <WalletIcon width={33} height={33} />
                          <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full md:hidden' />
                        </>
                      )}
                    </div>
                    <span className='hidden md:block'>
                      {account.ensName || account.displayName}
                    </span>
                    <ExpandMoreIcon height={12} width={12} />
                  </button>
                </div>
              );
            })()}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
};
