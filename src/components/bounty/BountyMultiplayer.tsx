import { useState } from 'react';

import { ExpandMoreIcon } from '@/components/global/Icons';
import { trpc } from '@/trpc/client';
import { Chain } from '@/utils/types';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { cn } from '@/utils';
import CopyAddressButton from '../global/CopyAddressButton';
import DisplayAddress from '../global/DisplayAddress';
import Withdraw from './Withdraw';
import JoinBounty from './JoinBounty';

export default function BountyMultiplayer({
  chain,
  bountyId,
  inProgress,
  issuer,
  isVoting,
}: {
  chain: Chain;
  bountyId: string;
  inProgress: boolean;
  issuer: string;
  isVoting: boolean;
}) {
  const [showParticipants, setShowParticipants] = useState(false);
  const account = useAccount();

  const participants = trpc.participations.useQuery(
    {
      bountyId: Number(bountyId),
      chainId: chain.id,
    },
    {
      enabled: !!bountyId,
    }
  );

  const isCurrentUserAParticipant = participants.data?.some(
    (participant) =>
      participant.user_address.toLocaleLowerCase() ===
      account.address?.toLocaleLowerCase()
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
            className={cn(
              showParticipants ? '-rotate-180' : '',
              'animation-all duration-300'
            )}
          >
            <ExpandMoreIcon width={16} height={16} />
          </span>
        </button>

        {showParticipants && (
          <div className='border mt-5 border-white rounded-[8px] py-2 px-4 flex justify-between items-center backdrop-blur-sm bg-[#D1ECFF]/20 w-fit'>
            <div className='flex flex-col px-0'>
              {participants.isSuccess ? (
                participants.data.map((participant) => (
                  <div
                    key={participant.user_address}
                    className='flex items-center justify-between w-full'
                  >
                    <div className='flex flex-row items-center'>
                      <div className='mr-1'>
                        <CopyAddressButton
                          address={participant.user_address}
                          size={10}
                        />
                      </div>
                      <DisplayAddress
                        chain={chain}
                        address={participant.user_address}
                      />
                    </div>
                    &nbsp;
                    {`${formatEther(BigInt(participant.amount))} ${
                      chain.currency
                    }`}
                  </div>
                ))
              ) : (
                <p>Loading addresses…</p>
              )}
            </div>
          </div>
        )}
      </div>
      {account.address?.toLocaleLowerCase() !== issuer.toLocaleLowerCase() &&
      !isVoting &&
      inProgress &&
      isCurrentUserAParticipant ? (
        <Withdraw bountyId={bountyId} />
      ) : (
        !isVoting && inProgress && <JoinBounty bountyId={bountyId} />
      )}
    </>
  );
}
