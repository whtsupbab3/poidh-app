import App from '@/app/frames/[netname]/[id]/app';
import React from 'react';

const appUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/images/poidh-preview-hero.png`,
  button: {
    title: 'See Claims',
    action: {
      type: 'launch_frame',
      name: 'See Claims',
      url: `${appUrl}`,
      splashImageUrl: `${appUrl}/Logo_poidh.svg`,
      splashBackgroundColor: '#93c5fd',
    },
  },
};
export const metadata = {
  title: "poidh - pics or it didn't happen",
  description:
    "poidh - pics or it didn't happen - fully onchain bounties + collectible NFTs - start your collection today on Arbitrum, Base, or Degen Chain",
  other: {
    'fc:frame': JSON.stringify(frame),
  },
};

const FrameHome = ({ params }: { params: { id: string; netname: string } }) => {
  console.log(params);

  return <App bountyId={params.id} chainId={params.netname} />;
};

export default FrameHome;
