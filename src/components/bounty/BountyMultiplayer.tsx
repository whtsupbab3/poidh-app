import Link from 'next/link';
import { useState } from 'react';
import { formatEther } from 'viem';
import { useQuery } from '@tanstack/react-query';

import { ExpandMoreIcon } from '@/components/global/Icons';
import JoinBounty from '@/components/ui/JoinBounty';
import Withdraw from '@/components/ui/Withdraw';
import { trpc } from '@/trpc/client';
import { Chain } from '@/utils/types';
import { getDegenOrEnsName } from '@/utils/web3';
import { useAccount } from 'wagmi';

export default function BountyMultiplayer({
  chain,
  bountyId,
  inProgress,
  issuer,
}: {
  chain: Chain;
  bountyId: string;
  inProgress: boolean;
  issuer: string;
}) {
  const [showParticipants, setShowParticipants] = useState(false);
  const account = useAccount();

  const participants = trpc.participants.useQuery(
    {
      bountyId: bountyId,
      chainId: chain.id.toString(),
    },
    {
      enabled: !!bountyId,
    }
  );

  const isCurrentUserAParticipant = participants.data?.some(
    (participant) => participant.user.id === account.address
  );

  return (
    <>
      <div>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className='border border-white rounded-full mt-5  px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'
        >
          {participants.data
            ? `${participants.data.length} contributors`
            : 'Loading contributors...'}
          <span
            className={`${
              showParticipants ? '-rotate-180' : ''
            } animation-all duration-300 `}
          >
            <ExpandMoreIcon width={16} height={16} />
          </span>
        </button>

        {showParticipants && (
          <div className='border mt-5 border-white rounded-[8px] px-10 lg:px-5 py-2 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'>
            <div className='flex flex-col'>
              {participants.isSuccess ? (
                participants.data.map((participant) => (
                  <Participant
                    participant={participant}
                    chain={chain}
                    key={participant.user.id}
                  />
                ))
              ) : (
                <p>Loading addresses…</p>
              )}
            </div>
          </div>
        )}
      </div>
      {account.address !== issuer ? (
        inProgress && isCurrentUserAParticipant ? (
          <Withdraw bountyId={bountyId} />
        ) : (
          <JoinBounty bountyId={bountyId} />
        )
      ) : null}
    </>
  );
}
function Participant({
  chain,
  participant,
}: {
  chain: Chain;
  participant: {
    user: { id: string; ens: string | null; degenName: string | null };
    amount: string;
  };
}) {
  const walletDisplayName = useQuery({
    queryKey: ['getWalletDisplayName', participant.user.id, chain.slug],
    queryFn: () =>
      getWalletDisplayName({
        address: participant.user.id,
        chainName: chain.slug,
      }),
  });

  return (
    <div className='py-2'>
      <Link href={`/${chain.slug}/account/${participant.user.id}`}>
        {walletDisplayName.data ?? participant.user.id}
      </Link>{' '}
      - {formatEther(BigInt(participant.amount))} {chain.currency}
    </div>
  );
}

async function getWalletDisplayName({
  address,
  chainName,
}: {
  address: string;
  chainName: 'arbitrum' | 'base' | 'degen';
}) {
  const nickname = await getDegenOrEnsName({ address, chainName });
  if (nickname) {
    return nickname;
  }

  return address.slice(0, 6) + '…' + address.slice(-4);
}
