import { ExpandMoreIcon } from '@/components/global/Icons';
import { useGetChain } from '@/hooks/useGetChain';
import Link from 'next/link';
import React from 'react';

export default function BreadcrumpNavigation() {
  const chain = useGetChain();

  return (
    <div className='flex items-center space-x-2 mt-5'>
      <Link href='/' className='hover:underline'>
        poidh
      </Link>
      <div className='transform -rotate-90'>
        <ExpandMoreIcon size={4} />
      </div>
      <Link href={`/${chain.slug}`} className='hover:underline'>
        {chain.slug + ' '}bounties
      </Link>
    </div>
  );
}
