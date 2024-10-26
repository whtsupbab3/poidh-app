import { getDegenOrEnsName } from '@/app/context/web3';
import { useGetChain } from '@/hooks';
import { useEffect, useState } from 'react';

export default function useDegenOrEnsName(addr: string) {
  const [result, setResult] = useState<string | null>(null);
  const chain = useGetChain();

  useEffect(() => {
    const cb = async () => {
      const degenOrEnsName = await getDegenOrEnsName({
        chainName: chain.chainPathName,
        address: addr,
      });
      setResult(degenOrEnsName);
    };

    cb();
  }, [addr]);

  return result;
}
