export type Currency = 'eth' | 'degen';

export type Netname = 'degen' | 'base' | 'arbitrum';

export type Chain = {
  id: number;
  name: string;
  currency: Currency;
  slug: Netname;
  provider: ReturnType<typeof import('viem').createPublicClient>;
  contracts: {
    mainContract: string;
    nftContract: string;
  };
};

export type Wallet = {
  id: string;
  ens: string | null;
  degenName: string | null;
};

export type Bounty = {
  title: string;
  description: string;
  isGenerating?: boolean;
};
