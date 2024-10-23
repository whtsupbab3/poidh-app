/* eslint-disable simple-import-sort/imports */
import { headers } from 'next/headers';
import React from 'react';

import '@/styles/globals.css';
import '@/styles/colors.css';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import ContextProvider from '@/app/context/ContextProvider';
import { TRPCProvider } from '@/trpc/client';

export const metadata = {
  title: "poidh - pics or it didn't happen",
  description:
    "poidh - pics or it didn't happen - fully onchain bounties + collectible NFTs - start your collection today on Arbitrum, Base, or Degen Chain",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const headersList = headers();
  const referer = headersList.get('referer');
  const url = referer ? String(referer) : '';

  return (
    <html>
      <head>
        <link rel='canonical' href={url} />
      </head>
      <body className='bg-blue-300 text-white'>
        <TRPCProvider>
          <ContextProvider>
            <Header />
            {children}
            <Footer />
          </ContextProvider>
        </TRPCProvider>
      </body>
    </html>
  );
};

export default RootLayout;
