'use client';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import React, { useEffect } from 'react';

import '@/styles/globals.css';
import '@/styles/colors.css';

import { useGetChain } from '@/hooks/useGetChain';

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const chain = useGetChain();

  const { primaryWallet } = useDynamicContext();

  useEffect(() => {
    if (primaryWallet && chain) {
      if (chain.id !== Number(primaryWallet.network)) {
        primaryWallet.connector.switchNetwork({ networkChainId: chain.id });
      }
    }
  }, [primaryWallet, chain]);

  return <>{children}</>;
}
