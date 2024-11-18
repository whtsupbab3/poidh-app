import React, { useEffect, useState } from 'react';

import { trpc } from '@/trpc/client';
import { useGetChain } from '@/hooks/useGetChain';
import ClaimList from '@/components/bounty/ClaimList';
import { bountyCurrentVotingClaim } from '@/utils/web3';

const PAGE_SIZE = 9;

export default function BountyClaims({ bountyId }: { bountyId: string }) {
  const chain = useGetChain();
  const [votingClaimId, setVotingClaimId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentVotingClaim = async () => {
      const currentVotingClaim = await bountyCurrentVotingClaim({
        id: bountyId,
        chainName: chain.slug,
      });
      setVotingClaimId(currentVotingClaim);
    };

    fetchCurrentVotingClaim();
  }, [bountyId, chain]);

  const claims = trpc.bountyClaims.useInfiniteQuery(
    {
      bountyId: Number(bountyId),
      chainId: chain.id,
      limit: PAGE_SIZE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!bountyId,
    }
  );

  const { data: votingClaim } = trpc.claim.useQuery(
    {
      claimId: Number(votingClaimId),
      chainId: chain.id,
    },
    {
      enabled: !!votingClaimId,
    }
  );

  const { data: bounty } = trpc.bounty.useQuery(
    {
      id: Number(bountyId),
      chainId: chain.id,
    },
    {
      enabled: !!bountyId,
    }
  );

  if (!claims) {
    return null;
  }

  return (
    <div>
      <div className='flex flex-col gap-x-2 py-4 border-b border-dashed'>
        <div>
          <span>
            {claims.data?.pages.reduce(
              (acc, curr) => acc + curr.items.length,
              0
            )}{' '}
            claims
          </span>
        </div>
      </div>
      {claims.data && (
        <ClaimList
          bountyId={bountyId}
          isMultiplayer={bounty?.isMultiplayer || false}
          votingClaim={
            votingClaim
              ? {
                  ...votingClaim,
                  accepted: votingClaim.is_accepted || false,
                  id: votingClaim.id.toString(),
                  bountyId: votingClaim.bounty_id.toString(),
                  issuer: votingClaim.issuer,
                }
              : null
          }
          claims={claims.data.pages.flatMap((page) => {
            return page.items.map((item) => ({
              ...item,
              accepted: item.is_accepted || false,
              id: item.id.toString(),
              issuer: item.issuer,
              bountyId: item.bounty_id.toString(),
            }));
          })}
        />
      )}
      {claims.hasNextPage && (
        <div className='flex justify-center items-center'>
          <button
            onClick={() => claims.fetchNextPage()}
            className='border border-white rounded-full px-5 backdrop-blur-sm bg-[#D1ECFF]/20 py-2'
            disabled={claims.isFetchingNextPage}
          >
            {claims.isFetchingNextPage ? 'loading…' : 'show more'}
          </button>
        </div>
      )}
    </div>
  );
}
