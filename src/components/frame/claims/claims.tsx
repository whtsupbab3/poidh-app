import { BountyResponse } from '@/app/api/bounties/[chainName]/[bountyId]/route';
import ClaimItem from '@/components/bounty/ClaimItem';
import { useGetChain } from '@/hooks/useGetChain';
import { trpc } from '@/trpc/client';
import { fetchBounty } from '@/utils/utils';
import { bountyCurrentVotingClaim } from '@/utils/web3';
import React, { useEffect, useState } from 'react';

// Add chain configuration
const CHAIN_INFO: Record<
  number,
  { symbol: string; isEVM: boolean; name: string }
> = {
  8453: {
    // Base
    symbol: 'ETH',
    isEVM: true,
    name: 'Base',
  },
  42161: {
    // Arbitrum
    symbol: 'ETH',
    isEVM: true,
    name: 'Arbitrum',
  },
  666666666: {
    // Degen
    symbol: 'DEGEN',
    isEVM: false,
    name: 'Degen',
  },
};

// Amount formatting utility
const formatAmount = (amount: string, chainId: number) => {
  try {
    if (!amount) return '0';

    const chain = CHAIN_INFO[chainId];
    if (!chain) return amount;

    if (chain.isEVM) {
      // Convert wei to ETH for base and arbitrum
      const weiAmount = BigInt(amount);
      const ethAmount = Number(weiAmount) / 1e18;

      return `${chain.name} ${ethAmount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      })} ${chain.symbol}`;
    } else {
      // Format DEGEN amount
      const numberAmount = (parseInt(amount) / 1000000000000000000).toString();
      return `${numberAmount.toLocaleString()} DEGEN`;
    }
  } catch (error) {
    console.error('Error formatting amount:', error);
    return amount;
  }
};

const Claims = ({
  bountyId,
  chainId,
}: {
  bountyId: string;
  chainId: string;
}) => {
  const [bounty, setBounty] = React.useState<BountyResponse['bounty'] | null>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [votingClaimId, setVotingClaimId] = useState<number | null>(null);
  const chain = useGetChain();

  useEffect(() => {
    const fetchCurrentVotingClaim = async () => {
      const currentVotingClaim = await bountyCurrentVotingClaim({
        id: bountyId,
        chainName: chainId as 'degen' | 'arbitrum' | 'base',
      });
      setVotingClaimId(currentVotingClaim);
    };

    void fetchCurrentVotingClaim();
  }, [bountyId, chainId]);

  React.useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const bountyData = await fetchBounty(chainId, bountyId);
        setBounty(bountyData.bounty);
      } catch {
        setBounty(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchClaims();
  }, [bountyId, chainId]);

  const { data: votingClaim } = trpc.claim.useQuery(
    {
      claimId: Number(votingClaimId),
      chainId: chain.id,
    },
    {
      enabled: !!votingClaimId,
    }
  );

  const votingClaimRes = votingClaim
    ? {
        ...votingClaim,
        accepted: votingClaim.is_accepted || false,
        id: votingClaim.id.toString(),
        bountyId: votingClaim.bounty_id.toString(),
        issuer: votingClaim.issuer,
      }
    : null;
  const isVotingOrAcceptedBounty =
    !!votingClaimRes || bounty?.claims.some((claim) => claim.is_accepted);

  return (
    <div className='w-full flex items-center justify-start p-6 flex-col gap-4'>
      <div className='w-full flex items-center justify-start flex-col gap-4'>
        {/* <h1 className='text-3xl font-bold text-center capitalize underline '>
          Bounty {bounty && `#${bounty?.id}`}
        </h1> */}
        {bounty && (
          <>
            <h3 className='text-2xl font-semibold text-center'>
              "{bounty?.title}"
            </h3>
            <p className='text-xl font-medium text-center'>
              {bounty?.description}
            </p>
            <p className='text-lg font-medium text-center'>
              {formatAmount(bounty?.amount, bounty.chain_id)}
            </p>
            <p className='text-lg font-medium text-center'>
              Total Claims:{' '}
              <span className='underline'>{bounty?.claims.length}</span>
            </p>
          </>
        )}
      </div>
      {loading ? (
        <p className='text-center text-white font-bold w-full'>
          Bounty Loading...
        </p>
      ) : !bounty ? (
        <p className='text-center text-white font-bold w-full'>
          Bounty Not Found :(
        </p>
      ) : bounty.claims.length === 0 ? (
        <p className='text-center text-white font-bold w-full'>
          No Claims found
        </p>
      ) : (
        <div className='w-full flex items-center justify-start flex-col gap-8 lg:grid lg:grid-cols-3'>
          {bounty.claims.map((claim) => (
            <ClaimItem
              key={claim.id}
              bountyId={bountyId}
              id={claim.id.toString()}
              title={claim.title}
              description={claim.description}
              issuer={claim.issuer.address as string}
              accepted={claim.is_accepted ?? false}
              url={claim.url}
              isVotingOrAcceptedBounty={isVotingOrAcceptedBounty ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Claims;
