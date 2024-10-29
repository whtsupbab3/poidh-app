'use client';
import Link from 'next/link';
import React, { useState } from 'react';

import { useGetChain } from '@/hooks/useGetChain';
import Banner from '@/components/global/Banner';
import Menu from '@/components/global/Menu';
import Logo from '@/components/ui/Logo';
import { MenuIcon } from '@/components/global/Icons';
import { Drawer } from '@mui/material';
import ConnectWallet from '@/components/global/ConnectWallet';

const Header = () => {
  const chain = useGetChain();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Drawer
        open={isOpen}
        onClose={(cur) => setIsOpen(!cur)}
        PaperProps={{
          className: 'w-60 bg-[#F15E5F]',
        }}
      >
        <Menu />
      </Drawer>
      <Banner />
      <div className='flex justify-between items-center h-16 px-5 lg:px-20 border-b border-white'>
        <div className='flex'>
          <button
            onClick={() => setIsOpen(true)}
            className='mr-4 hover:text-[#F15E5F]'
          >
            <MenuIcon width={30} height={30} />
          </button>
          <Link href={`/${chain.chainPathName}`}>
            <Logo />
          </Link>
        </div>
        <ConnectWallet />
      </div>
    </>
  );
};

export default Header;
