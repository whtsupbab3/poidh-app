import { Metadata } from 'next';

const appUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

export const generateMetadataForBountyFrame = async ({
  params,
}: {
  params: { id: string; netname: string };
}): Promise<Metadata> => {
  console.log('PARAMS', params);

  const frame = {
    version: 'next',
    imageUrl: `${appUrl}/frames/image?chainName=${params?.netname}&bountyId=${params?.id}`,
    button: {
      title: 'See Claims',
      action: {
        type: 'launch_frame',
        name: 'See Claims',
        url: `${appUrl}/frames/${params?.netname}/${params?.id}`,
        splashImageUrl: `${appUrl}/Logo_poidh.svg`,
        splashBackgroundColor: '#93c5fd',
      },
    },
  };

  return {
    title: "poidh - pics or it didn't happen",
    description:
      "poidh - pics or it didn't happen - fully onchain bounties + collectible NFTs - start your collection today on Arbitrum, Base, or Degen Chain",
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
};
