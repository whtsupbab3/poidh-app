'use client';

import React, { useEffect } from 'react';

import '@/styles/globals.css';
import '@/styles/colors.css';

import { useGetChain } from '@/hooks/useGetChain';
import { useAccount, useSwitchChain } from 'wagmi';

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const chain = useGetChain();
  const account = useAccount();
  const switchChain = useSwitchChain();

  useEffect(() => {
    if (account.isConnected) {
      if (chain.id !== account.chainId) {
        switchChain.switchChain({ chainId: chain.id });
      }
    }
  }, [account, chain, switchChain]);

  return <>{children}</>;
}
