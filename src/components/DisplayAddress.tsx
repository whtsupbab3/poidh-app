import { useQuery } from '@tanstack/react-query';
import { getDegenOrEnsName } from '@/utils/web3';
import Link from 'next/link';
import { Chain } from '@/utils/types';

export default function DisplayAddress({
  chain,
  address,
}: {
  chain: Chain;
  address: string;
}) {
  const walletDisplayName = useQuery({
    queryKey: ['getWalletDisplayName', address, chain.slug],
    queryFn: () =>
      getWalletDisplayName({
        address: address,
        chainName: chain.slug,
      }),
  });

  return (
    <Link
      href={`/${chain.slug}/account/${address}`}
      className='overflow-hidden lg:w-[25ch] w-[15ch] overflow-ellipsis hover:text-gray-200'
    >
      {walletDisplayName.data ?? address}
    </Link>
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
