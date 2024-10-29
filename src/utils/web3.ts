/* eslint-disable no-console */

import { Wallet } from '@dynamic-labs/sdk-react-core';
import { Contract, ethers } from 'ethers';
import { parseEther } from 'viem';

import { ABI, DEGENNAMERESABI } from '@/constant';
import { chains } from '@/utils/config';
import publicClient from '@/utils/publicClient';

export async function getContract({
  wallet,
  chainName,
}: {
  wallet: Wallet;
  chainName: 'degen' | 'arbitrum' | 'base';
}) {
  const signer = await wallet?.connector?.ethers?.getSigner();
  return new Contract(chains[chainName].contracts.mainContract, ABI, signer);
}

export async function getContractRead({
  chainName,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
}) {
  const chain = chains[chainName];
  const provider = new ethers.JsonRpcProvider(chain.jsonProviderUrl);
  return new Contract(chain.contracts.mainContract, ABI, provider);
}

async function getDegenNameContract({
  chainName,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
}) {
  const provider = new ethers.JsonRpcProvider(
    chains[chainName].jsonProviderUrl
  );

  return new Contract(
    '0x4087fb91A1fBdef05761C02714335D232a2Bf3a1',
    DEGENNAMERESABI,
    provider
  );
}

export async function getDegenOrEnsName({
  chainName,
  address,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  address: string;
}) {
  if (chainName === 'arbitrum') {
    return null;
  }

  const degenNameContract = await getDegenNameContract({ chainName });
  const degenName = await degenNameContract.defaultNames(address);
  if (degenName) {
    return `${degenName}.degen`;
  }
  return publicClient.getEnsName({
    address: address as `0x${string}`,
  });
}

export async function createSoloBounty({
  wallet,
  chainName,
  name,
  description,
  value,
}: {
  wallet: Wallet;
  chainName: 'degen' | 'arbitrum' | 'base';
  name: string;
  description: string;
  value: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });

    const options = {
      value: parseEther(value),
    };

    const transaction = await contract.createSoloBounty(
      name,
      description,
      options
    );

    return transaction.wait();
  } catch (error) {
    console.error('Error creating bounty:', error);
    throw error;
  }
}

export async function createOpenBounty({
  chainName,
  wallet,
  name,
  description,
  value,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  name: string;
  description: string;
  value: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });

    const options = {
      value: parseEther(value),
    };

    const transaction = await contract.createOpenBounty(
      name,
      description,
      options
    );

    return transaction.wait();
  } catch (error) {
    console.error('Error creating bounty:', error);
    throw error;
  }
}

export async function createClaim({
  chainName,
  wallet,
  name,
  uri,
  description,
  bountyId,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  name: string;
  uri: string;
  description: string;
  bountyId: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });

    const transaction = await contract.createClaim(
      bountyId,
      name,
      uri,
      description
    );

    return transaction.wait();
  } catch (error) {
    console.error('Error creating claim:', error);
    throw error;
  }
}

export async function acceptClaim({
  chainName,
  wallet,
  bountyId,
  claimId,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  bountyId: string;
  claimId: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.acceptClaim(bountyId, claimId);
    return transaction.wait();
  } catch (error) {
    console.error('Error accepting claim:', error);
    throw error;
  }
}

export async function submitClaimForVote({
  chainName,
  wallet,
  bountyId,
  claimId,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  bountyId: string;
  claimId: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.submitClaimForVote(bountyId, claimId);
    return transaction.wait();
  } catch (error) {
    console.error('Error accepting claim:', error);
    throw error;
  }
}

export async function cancelSoloBounty({
  wallet,
  chainName,
  id,
}: {
  wallet: Wallet;
  chainName: 'degen' | 'arbitrum' | 'base';
  id: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.cancelSoloBounty(id);
    return transaction.wait();
  } catch (error) {
    console.error('Error canceling solo bounty:', error);
    throw error;
  }
}

export async function cancelOpenBounty({
  chainName,
  wallet,
  id,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  id: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.cancelOpenBounty(id);
    return transaction.wait();
  } catch (error) {
    console.error('Error canceling open bounty:', error);
    throw error;
  }
}

export async function withdrawFromOpenBounty({
  chainName,
  wallet,
  id,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  id: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.withdrawFromOpenBounty(id);
    return transaction.wait();
  } catch (error) {
    console.error('Error widthdraw:', error);
    throw error;
  }
}

export async function voteClaim({
  chainName,
  wallet,
  bountyId,
  vote,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  bountyId: string;
  vote: boolean;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.voteClaim(bountyId, vote);
    return transaction.wait();
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
}

export async function resolveVote({
  wallet,
  chainName,
  bountyId,
}: {
  wallet: Wallet;
  chainName: 'degen' | 'arbitrum' | 'base';
  bountyId: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });
    const transaction = await contract.resolveVote(bountyId);
    return transaction.wait();
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
}

export async function joinOpenBounty({
  chainName,
  wallet,
  id,
  value,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  wallet: Wallet;
  id: string;
  value: string;
}) {
  try {
    const contract = await getContract({ wallet, chainName });

    const options = {
      value: parseEther(value),
    };
    const transaction = await contract.joinOpenBounty(id, options);
    await transaction.wait();
  } catch (error) {
    console.error('Error joining open bounty:', error);
    throw error;
  }
}

export async function bountyCurrentVotingClaim({
  chainName,
  id,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  id: string;
}) {
  const contract = await getContractRead({ chainName });
  const currentVotingClaim = await contract.bountyCurrentVotingClaim(id);
  const votingClaimNumber = Number(currentVotingClaim.toString());
  return votingClaimNumber;
}

export async function bountyVotingTracker({
  chainName,
  id,
}: {
  chainName: 'degen' | 'arbitrum' | 'base';
  id: string;
}) {
  const contract = await getContractRead({ chainName });
  const [yes, no, deadline] = await contract.bountyVotingTracker(id);
  const votingTracker = {
    yes: yes.toString(),
    no: no.toString(),
    deadline: deadline.toString(),
  };
  return votingTracker;
}
