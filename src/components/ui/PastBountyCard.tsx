import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CopyIcon } from '@/components/global/Icons';
import { chains } from '@/utils/config';
import { Claim } from '@/utils/types';
import { Chain } from '@/utils/types';
import { useRouter } from 'next/navigation';
import { formatEther } from 'viem';

const getChainById = (chainId: number): Chain | undefined =>
  Object.values(chains).find((chain) => chain.id === chainId);

export default function PastBountyCard({
  claim,
  chainId,
  bountyTitle,
  bountyAmount,
}: {
  claim: Claim;
  chainId: number;
  bountyTitle: string;
  bountyAmount: string;
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const chain = getChainById(chainId);

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
            const chainName = chain?.slug;
            router.push(`/${chainName}/bounty/${claim.bountyId}`);
          }}
        >
          <div className='p-[2px] text-white relative bg-[#F15E5F] border-[#F15E5F] border-2 rounded-xl'>
            <div>
              {claim.accepted && (
                <div className='left-5 top-5 text-white bg-[#F15E5F] border border-[#F15E5F] rounded-[8px] py-2 px-5 absolute'>
                  accepted
                </div>
              )}
              <div
                style={{ backgroundImage: `url(${imageUrl})` }}
                className='bg-[#12AAFF] bg-cover bg-center w-full aspect-w-1 aspect-h-1 rounded-[8px] overflow-hidden'
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
                <div className='mt-2 py-2 flex flex-row justify-between text-sm border-t border-dashed'>
                  <span className=''>issuer</span>
                  <span className='flex flex-row'>
                    <Link
                      href={`/${chain?.slug}/account/${claim?.issuer}`}
                      className='hover:text-gray-200'
                    >
                      {claim?.issuer.slice(0, 5) +
                        '…' +
                        claim?.issuer.slice(-6)}
                    </Link>
                    <span className='ml-1 text-white'>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(claim?.issuer);
                          toast.success('Address copied to clipboard');
                        }}
                      >
                        <CopyIcon width={16} height={16} />
                      </button>
                    </span>
                  </span>
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
