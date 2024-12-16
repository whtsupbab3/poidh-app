'use client';

import dynamic from 'next/dynamic';

const Claims = dynamic(() => import('@/components/frame/claims/claims'), {
  ssr: false,
});

export default function App({
  bountyId,
  chainId,
}: {
  bountyId: string;
  chainId: string;
}) {
  return <Claims chainId={chainId} bountyId={bountyId} />;
}
