import { BountyResponse } from '@/app/api/bounties/[chainName]/[bountyId]/route';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
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

export const fetchBounty = async (
  chainName: string | null,
  bountyId: string | null
): Promise<BountyResponse> => {
  const response = await fetch(
    `https://poidh-app-theta.vercel.app/api/bounties/${chainName}/${bountyId}`
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
