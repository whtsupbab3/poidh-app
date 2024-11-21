'use client';

import React from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import ContentHome from '@/components/layout/ContentHome';
import NavBarMobile from '@/components/global/NavBarMobile';
import CreateBounty from '@/components/ui/CreateBounty';
import { useScreenSize } from '@/hooks/useScreenSize';

export default function Home() {
  const isMobile = useScreenSize();

  return (
    <>
      <ContentHome />
      {isMobile ? <NavBarMobile type='bounty' /> : <CreateBounty />}
      <ToastContainer />
    </>
  );
}
