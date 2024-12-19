import { BountyResponse } from '@/app/api/bounties/[chainName]/[bountyId]/route';
import React from 'react';

const BountyCard = ({
  bounty: bountyData,
}: {
  bounty: BountyResponse['bounty'];
}) => {
  return (
    <div
      tw='w-full h-full p-6 flex flex-col relative'
      style={{
        background:
          'linear-gradient(to bottom, #2a81d5, #70aae2, #6fa9e1, #2a81d5)',
        gap: '16px',
      }}
    >
      {/* POIDH Text */}
      <div tw='w-full text-center flex items-center justify-center'>
        <span tw='text-red-500 font-bold text-xl'>poidh</span>
      </div>

      {/* Bounty Content */}
      <div
        style={{ gap: '16px' }}
        tw='flex flex-col items-center justify-start text-white'
      >
        <h3 style={{ margin: 0 }} tw='text-2xl font-semibold'>
          {bountyData.title}
        </h3>
        <p tw='text-lg font-medium' style={{ margin: 0 }}>
          {bountyData.description}
        </p>
        <div tw='text-sm font-normal flex items-center justify-center'>
          Issuer: {bountyData.issuer.address}
        </div>
      </div>
    </div>
  );
};

export default BountyCard;
