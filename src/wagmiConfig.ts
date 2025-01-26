'use client';

import { createConfig, http } from 'wagmi';
import { arbitrum, base, degen } from 'wagmi/chains';
import { farcasterFrame } from '@farcaster/frame-wagmi-connector';
import { injected, walletConnect } from 'wagmi/connectors';

const DEGEN_RPC_URL =
  'https://degen-mainnet.g.alchemy.com/v2/u14hNDLOC4WItmevbcUWItEg6KThN5W0';
const ARBITRUM_RPC_URL =
  'https://arb-mainnet.g.alchemy.com/v2/XCJ_kTDkVWrwvQ8vbOOXNxKvKyN30Lu1';
const BASE_RPC_URL =
  'https://base-mainnet.g.alchemy.com/v2/u14hNDLOC4WItmevbcUWItEg6KThN5W0';

const projectId = '784d6347a43d3f6e89f58b177f1b27f2';

export const config = createConfig({
  chains: [degen, arbitrum, base],
  transports: {
    [degen.id]: http(DEGEN_RPC_URL),
    [arbitrum.id]: http(ARBITRUM_RPC_URL),
    [base.id]: http(BASE_RPC_URL),
  },
  connectors: [farcasterFrame(), walletConnect({ projectId }), injected()],
});

export default config;
