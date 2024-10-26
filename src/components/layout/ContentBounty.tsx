import BountyClaims from '@/components/bounty/BountyClaims';
import BountyInfo from '@/components/bounty/BountyInfo';

export default function ContentBounty({ bountyId }: { bountyId: string }) {
  return (
    <div className='pb-44'>
      <BountyInfo bountyId={bountyId} />
      <BountyClaims bountyId={bountyId} />
    </div>
  );
}
