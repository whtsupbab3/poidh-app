'use client';
import * as React from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import BountyClaims from '@/components/bounty/BountyClaims';
import BountyInfo from '@/components/bounty/BountyInfo';
import CreateClaim from '@/components/ui/CreateClaim';

export default function Bounty({ params }: { params: { id: string } }) {
  return (
    <>
      <div className='px-5 lg:px-20'>
        <BountyInfo bountyId={params.id} />
        <BountyClaims bountyId={params.id} />
      </div>
      <CreateClaim bountyId={params.id} />
      <ToastContainer />
      <div className='h-80' />
    </>
  );
}
