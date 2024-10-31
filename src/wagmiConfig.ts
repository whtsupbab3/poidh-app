'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'viem';
import { arbitrum, base, degen } from 'wagmi/chains';

const DEGEN_RPC_URL =
  'https://rpc-degen-mainnet-1.t.conduit.xyz/8TM2tJu2NV9h6McqXqDPHCnsvCdwVgyrH';
const ARBITRUM_RPC_URL =
  'https://arb-mainnet.g.alchemy.com/v2/XCJ_kTDkVWrwvQ8vbOOXNxKvKyN30Lu1';
const BASE_RPC_URL =
  'https://api.developer.coinbase.com/rpc/v1/base/q_7UksVVI6bvOgx0y6-hR123IsVxVk3-';

export const config = getDefaultConfig({
  appName: 'poidh',
  projectId: '784d6347a43d3f6e89f58b177f1b27f2',
  chains: [degen, arbitrum, base],
  transports: {
    [degen.id]: http(DEGEN_RPC_URL),
    [arbitrum.id]: http(ARBITRUM_RPC_URL),
    [base.id]: http(BASE_RPC_URL),
  },
  ssr: true,
});
