import { useQuery } from '@tanstack/react-query';
import { getDegenOrEnsName } from '@/utils/web3';
import Link from 'next/link';
import { Chain } from '@/utils/types';
import { useState } from 'react';
import { CopyDoneIcon, CopyIcon } from '@/components/global/Icons';

export default function CopiableAdress({
  chain,
  address,
}: {
  chain: Chain;
  address: string;
}) {
  const [isCopied, setCopied] = useState(false);

  const walletDisplayName = useQuery({
    queryKey: ['getWalletDisplayName', address, chain.slug],
    queryFn: () =>
      getWalletDisplayName({
        address: address,
        chainName: chain.slug,
      }),
  });

  return (
    <div className='flex flex-row'>
      <Link
        href={`/${chain.slug}/account/${address}`}
        className='hover:text-gray-200'
      >
        {walletDisplayName.isLoading
          ? formatWalletAddress(address)
          : walletDisplayName.data || formatWalletAddress(address)}
      </Link>
      <span
        onClick={(e) => {
          e.preventDefault();
          setCopied(true);
          navigator.clipboard.writeText(address);
          setTimeout(() => {
            setCopied(false);
          }, 1000);
        }}
        className='cursor-pointer ml-2 hover:text-gray-200'
      >
        {isCopied ? (
          <CopyDoneIcon width={20} height={20} />
        ) : (
          <CopyIcon width={20} height={20} />
        )}
      </span>
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
  return null;
}

function formatWalletAddress(address: string): string {
  return address.slice(0, 6) + '…' + address.slice(-4);
}
