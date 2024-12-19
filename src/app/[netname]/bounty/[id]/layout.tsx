/* eslint-disable import/order */
import { Metadata } from 'next';
import prisma from 'prisma/prisma';
import * as React from 'react';

import '@/styles/colors.css';

import { Netname } from '@/utils/types';
import { chains } from '@/utils/config';

type Props = {
  params: { id: string; netname: Netname };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.id;
  const chain = chains[params.netname];

  const bounty =
    id !== 'null'
      ? await prisma.bounties.findFirst({
          where: {
            id: Number(id),
            chain_id: chain.id,
          },
        })
      : null;

  // Create the frame embed object according to spec
  const frameEmbed = {
    version: 'next',
    image: `https://poidh-app-theta.vercel.app/frames/image?chainName=${chain}&bountyId=${bounty?.id}`,
    button: {
      title: 'See Claims',
      action: {
        type: 'launch_frame',
        name: 'See Claims',
        url: `https://poidh-app-theta.vercel.app/frames/${chain}/${bounty?.id}`,
        splashImageUrl: `https://poidh-app-theta.vercel.app/Logo_poidh.svg`,
        splashBackgroundColor: '#93c5fd',
      },
    },
  };

  return {
    title: bounty?.title || '',
    description: bounty?.description || '',

    openGraph: {
      title: bounty?.title || '',
      description: bounty?.description || '',
      siteName: 'POIDH',
      images: [`https://poidh.xyz/images/poidh-preview-hero.png`],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: bounty?.title || '',
      description: bounty?.description || '',
      images: [`https://poidh.xyz/images/poidh-preview-hero.png`],
    },
    other: {
      'fc:frame': JSON.stringify(frameEmbed),
    },
  };
}

export default function BountyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
