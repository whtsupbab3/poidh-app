/* eslint-disable simple-import-sort/imports */
import { usePathname } from 'next/navigation';

import { chains } from '@/app/context/config';
import { Chain, Netname } from '@/types/web3';

const chainPathName = {
  degen: '/degen',
  base: '/base',
  arbitrum: '/arbitrum',
};

export const useGetChain = (): Chain => {
  const pathname = usePathname();

  for (const [key, value] of Object.entries(chainPathName)) {
    if (pathname.startsWith(value)) {
      return chains[key as Netname];
    }
  }

  return chains['base'];
};
