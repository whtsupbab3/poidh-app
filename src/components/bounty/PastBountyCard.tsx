import React, { useEffect, useState } from 'react';
import { ChainId, Claim } from '@/utils/types';
import { formatEther } from 'viem';
import { getChainById } from '@/utils/config';
import DisplayAddress from '../global/DisplayAddress';
import CopyAddressButton from '../global/CopyAddressButton';

export default function PastBountyCard({
  claim,
  bountyTitle,
  bountyAmount,
}: {
  claim: Claim;
  bountyTitle: string;
  bountyAmount: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const chain = getChainById(claim.chainId as ChainId);

  const fetchImageUrl = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    setImageUrl(data.image);
  };

  useEffect(() => {
    fetchImageUrl(claim?.url);
  }, [claim]);

  return (
    <>
      {claim && (
        <div
          className='lg:col-span-4 p-3 bg-whiteblue border-1 rounded-xl cursor-pointer'
          onClick={() => {
            window.location.href = `/${chain?.slug}/bounty/${claim.bountyId}`;
          }}
        >
          <div className='p-[2px] text-white relative bg-poidhRed border-poidhRed border-2 rounded-xl'>
            <div>
              {claim.accepted && (
                <div className='left-5 top-5 text-white bg-poidhRed border border-poidhRed rounded-[8px] py-2 px-5 absolute'>
                  accepted
                </div>
              )}
              <div
                style={{ backgroundImage: `url(${imageUrl})` }}
                className='bg-poidhBlue bg-cover bg-center w-full aspect-w-1 aspect-h-1 rounded-[8px] overflow-hidden'
              ></div>
              <div className='p-3'>
                <div className='flex flex-col'>
                  <p className='normal-case text-nowrap overflow-ellipsis overflow-hidden break-word text-left'>
                    {claim.title}
                  </p>
                  <p className='normal-case w-full h-20 overflow-y-auto overflow-x-hidden overflow-hidden break-words text-left'>
                    {claim.description}
                  </p>
                </div>
                <div className='mt-2 py-2 flex flex-row items-center text-sm border-t border-dashed'>
                  <span className='shrink-0 mr-2'>issuer&nbsp;</span>
                  <div className='flex flex-row  items-center w-full justify-end overflow-hidden'>
                    <DisplayAddress chain={chain} address={claim.issuer} />
                    <div className='ml-2'>
                      <CopyAddressButton address={claim.issuer} />
                    </div>
                  </div>
                </div>
                <div className='text-left'>claim id: {claim?.id}</div>
              </div>
            </div>
          </div>
          <div className='px-1 py-3 text-left'>
            <p className='text-nowrap overflow-ellipsis overflow-hidden text-xl mb-3 normal-case'>
              {bountyTitle}
            </p>
            <span className='text-md'>
              {formatEther(BigInt(bountyAmount))} {chain?.currency}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
