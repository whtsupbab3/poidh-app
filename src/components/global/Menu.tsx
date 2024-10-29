import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Link from 'next/link';
import React from 'react';

import { useGetChain } from '@/hooks/useGetChain';
import NetworkSelector from '@/components/global/NetworkSelector';

const MenuLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link href={href} className='hover:text-gray-300'>
    {children}
  </Link>
);

export default function Menu() {
  const chain = useGetChain();
  const { isAuthenticated, primaryWallet } = useDynamicContext();

  return (
    <div className='flex gap-2 flex-col p-5 text-white'>
      {isAuthenticated && (
        <MenuLink
          href={`/${chain.chainPathName}/account/${primaryWallet?.address}`}
        >
          my account
        </MenuLink>
      )}
      <MenuLink href='https://paragraph.xyz/@poidh/poidh-beginner-guide'>
        how it works
      </MenuLink>
      <MenuLink href='https://github.com/picsoritdidnthappen/poidh-app'>
        github
      </MenuLink>
      <MenuLink href='https://dune.com/yesyes/poidh-pics-or-it-didnt-happen'>
        analytics
      </MenuLink>
      <MenuLink href='https://warpcast.com/poidhbot'>farcaster</MenuLink>
      <MenuLink href='https://x.com/poidhxyz'>twitter</MenuLink>
      <MenuLink href='https://github.com/picsoritdidnthappen/poidh-app/issues/new'>
        report bug
      </MenuLink>
      <MenuLink href='http://localhost:3000/terms'>terms</MenuLink>
      <div className='flex justify-center mt-4'>
        <NetworkSelector width={24} height={24} />
      </div>
    </div>
  );
}
