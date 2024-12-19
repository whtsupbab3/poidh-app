import BountyCard from '@/components/frame/claims/Bounty';
import BountyErrorCard from '@/components/frame/claims/Error';
import { fetchBounty } from '@/utils/utils';
import { ImageResponse, NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chainId = searchParams.get('chainId');
  const bountyId = searchParams.get('bountyId');
  const isSuccess = searchParams.get('success');
  const msg = searchParams.get('msg');

  if (!!isSuccess && msg) {
    return new ImageResponse(<BountyErrorCard message={msg} />, {
      width: 570,
      height: 320,
    });
  }

  try {
    const bountyData = await fetchBounty(chainId!, bountyId!);
    return new ImageResponse(<BountyCard bounty={bountyData.bounty} />, {
      width: 570,
      height: 320,
    });
  } catch {
    return new ImageResponse(<BountyErrorCard />, {
      width: 570,
      height: 320,
    });
  }
}
