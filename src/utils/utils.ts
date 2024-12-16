import { BountyResponse } from '@/app/api/bounties/[chainName]/[bountyId]/route';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBanSignatureFirstLine({
  id,
  chainId,
  type,
}: {
  id: number;
  chainId: number;
  type: 'claim' | 'bounty';
}) {
  return `Ban ${type} id: ${id} chainId: ${chainId}\n`;
}

const dummyBounty = {
  id: '81',
  chain_id: 42161,
  title: 'Steven tries poidh',
  description: 'be Steven and upload a photo you took - any pic works!',
  amount: '1000000000000000',
  issuer: {
    address: '0x0e7f38ee61156d57b2b8ab4baa1648b0daa40217' as `0x${string}`,
  },
  in_progress: false,
  is_joined_bounty: false,
  is_canceled: false,
  is_multiplayer: false,
  is_voting: false,
  deadline: null,
  ban: [],
  claims: [
    {
      id: 158,
      chain_id: 42161,
      title: 'selfie',
      description: "You can keep the bounty but love what you're building",
      url: 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs/QmcPziPudrPqSDYG592vJzojDa2M4cen4TuWPJcdBiUmKG',
      issuer: { address: '0xcd574fb62f1b9be480588da00d7fbee32e5f1e4c' },
      is_accepted: true,
      bounty_id: 81,
      owner: '0x0e7f38ee61156d57b2b8ab4baa1648b0daa40217',
    },
    {
      id: 158,
      chain_id: 42161,
      title: 'test',
      description:
        'lorem lorem lorem lorem lorem lorem lorem lorem lorem lorem ',
      url: 'https://beige-impossible-dragon-883.mypinata.cloud/ipfs/QmcPziPudrPqSDYG592vJzojDa2M4cen4TuWPJcdBiUmKG',
      issuer: { address: '0xcd574fb62f1b9be480588da00d7fbee32e5f1e4c' },
      is_accepted: true,
      bounty_id: 81,
      owner: '0x0e7f38ee61156d57b2b8ab4baa1648b0daa40217',
    },
  ],
  participations: [
    {
      amount: '1000000000000000',
      user_address: '0x0e7f38ee61156d57b2b8ab4baa1648b0daa40217',
    },
  ],
  hasClaims: true,
  inProgress: false,
  isMultiplayer: false,
  isBanned: false,
  isCanceled: false,
};

export const fetchBounty = async (
  chainName: string,
  bountyId: string
): Promise<BountyResponse> => {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_VERCEL_URL ?? 'http://localhost:3000'
    }/api/bounties/${chainName}/${bountyId}`
  );
  const data = await response.json();

  return data as BountyResponse;
  // returning dummy data for now
  // return {
  //   bounty: {
  //     ...dummyBounty,
  //     id: Number(dummyBounty.id),
  //     status: {
  //       in_progress: dummyBounty.in_progress,
  //       is_joined_bounty: dummyBounty.is_joined_bounty,
  //       is_canceled: dummyBounty.is_canceled,
  //       is_multiplayer: dummyBounty.is_multiplayer,
  //       is_voting: dummyBounty.is_voting,
  //     },
  //     participants: dummyBounty.participations.map((p) => ({
  //       address: p.user_address,
  //       amount: p.amount,
  //       user: null,
  //     })),
  //   },
  // };
};
