import { useGetChain } from '@/hooks/useGetChain';
import { getDegenOrEnsName } from '@/utils/web3';
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
