import { z } from 'zod';

import prisma from 'prisma/prisma';

import { baseProcedure, createTRPCRouter } from '../init';
import serverEnv from '@/utils/serverEnv';
import { TRPCError } from '@trpc/server';
import { getAddress } from 'viem';
import { chains } from '@/utils/config';
import { getBanSignatureFirstLine } from '@/utils/utils';

export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .transform((v) => getAddress(v));

export const chainNameSchema = z
  .string()
  .regex(/^(degen|arbitrum|base)$/)
  .transform((v) => v as 'degen' | 'arbitrum' | 'base');

export const bytes32Schema = z
  .string()
  .regex(/^(0x)?[a-fA-F0-9]{64}$/)
  .transform((v) => (v.startsWith('0x') ? v : '0x' + v) as `0x${string}`);

export const bytesSchema = z
  .string()
  .regex(/^(0x)?([a-fA-F0-9]{2})*$/)
  .transform((v) => (v.startsWith('0x') ? v : '0x' + v) as `0x${string}`);

export const appRouter = createTRPCRouter({
  bounty: baseProcedure
    .input(z.object({ id: z.number(), chainId: z.number() }))
    .query(async ({ input }) => {
      const bounty = await prisma.bounties.findUniqueOrThrow({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
        },
        include: {
          claims: {
            take: 1,
          },
          participations: {
            select: {
              amount: true,
              user_address: true,
            },
          },
        },
      });

      return {
        ...bounty,
        id: bounty.id.toString(),
        hasClaims: bounty.claims.length > 0,
        inProgress: bounty.in_progress,
        isMultiplayer: bounty.is_multiplayer,
        isBanned: bounty.is_banned,
        isCanceled: bounty.is_canceled,
      };
    }),

  bounties: baseProcedure
    .input(
      z.object({
        chainId: z.number(),
        status: z.enum(['open', 'progress', 'past']),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      const items = await prisma.bounties.findMany({
        where: {
          chain_id: input.chainId,
          is_banned: false,
          ...(input.status === 'open'
            ? {
                in_progress: true,
              }
            : {}),
          ...(input.status === 'progress'
            ? {
                in_progress: true,
                is_voting: true,
                deadline: {
                  gte: Date.now() / 1000,
                },
              }
            : {}),
          ...(input.status === 'past'
            ? {
                in_progress: false,
              }
            : {}),
          ...(input.cursor ? { id: { lt: input.cursor } } : {}),
        },
        include: {
          claims: {
            take: 1,
          },
        },
        orderBy: { id: 'desc' },
        take: input.limit,
      });

      let nextCursor: (typeof items)[number]['id'] | undefined = undefined;
      if (items.length === input.limit) {
        nextCursor = items[items.length - 1].id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  participations: baseProcedure
    .input(z.object({ bountyId: z.number(), chainId: z.number() }))
    .query(async ({ input }) => {
      return prisma.participationsBounties.findMany({
        select: {
          amount: true,
          user_address: true,
        },
        where: {
          bounty_id: input.bountyId,
          chain_id: input.chainId,
        },
      });
    }),

  bountyClaims: baseProcedure
    .input(
      z.object({
        bountyId: z.number(),
        chainId: z.number(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
      })
    )
    .query(async ({ input }) => {
      const items = await prisma.claims.findMany({
        where: {
          bounty_id: input.bountyId,
          chain_id: input.chainId,
          is_banned: false,
          ...(input.cursor ? { id: { lt: input.cursor } } : {}),
        },
        orderBy: { id: 'desc' },
        take: input.limit,
        select: {
          id: true,
          issuer: true,
          bounty_id: true,
          title: true,
          description: true,
          is_accepted: true,
          url: true,
        },
      });

      let nextCursor: (typeof items)[number]['id'] | undefined = undefined;
      if (items.length === input.limit) {
        nextCursor = items[items.length - 1].id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  claim: baseProcedure
    .input(z.object({ claimId: z.number(), chainId: z.number() }))
    .query(async ({ input }) => {
      return prisma.claims.findUniqueOrThrow({
        where: {
          id_chain_id: {
            id: input.claimId,
            chain_id: input.chainId,
          },
          is_banned: false,
        },
        select: {
          id: true,
          issuer: true,
          bounty_id: true,
          title: true,
          description: true,
          is_accepted: true,
          url: true,
        },
      });
    }),

  userBounties: baseProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input }) => {
      const bounties = await prisma.bounties.findMany({
        where: {
          issuer: input.address,
          chain_id: input.chainId,
          is_banned: false,
          is_canceled: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          chain_id: true,
          amount: true,
          is_multiplayer: true,
          in_progress: true,
          claims: {
            take: 1,
          },
        },

        orderBy: { id: 'desc' },
      });

      return bounties.map((bounty) => ({
        id: bounty.id.toString(),
        title: bounty.title,
        description: bounty.description,
        network: bounty.chain_id.toString(),
        amount: bounty.amount,
        isMultiplayer: bounty.is_multiplayer || false,
        inProgress: bounty.in_progress || false,
        hasClaims: bounty.claims.length > 0,
      }));
    }),

  userClaims: baseProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input }) => {
      return prisma.claims.findMany({
        where: {
          issuer: input.address,
          chain_id: input.chainId,
          is_banned: false,
        },
        select: {
          id: true,
          title: true,
          description: true,
          is_accepted: true,
          url: true,
          bounty: {
            select: {
              id: true,
              amount: true,
            },
          },
          issuer: true,
          owner: true,
        },
        orderBy: { id: 'desc' },
      });
    }),

  userNFTs: baseProcedure
    .input(z.object({ address: z.string(), chainId: z.number() }))
    .query(async ({ input }) => {
      const NFTs = await prisma.claims.findMany({
        where: {
          owner: input.address,
          chain_id: input.chainId,
        },
        select: {
          id: true,
          url: true,
          title: true,
          description: true,
          bounty: {
            select: {
              id: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });
      return NFTs.map((NFT) => ({
        id: NFT.id.toString(),
        url: NFT.url,
        title: NFT.title,
        description: NFT.description,
        bountyId: NFT.bounty!.id.toString(),
      }));
    }),

  isBountyCreated: baseProcedure
    .input(z.object({ chainId: z.number(), id: z.number() }))
    .query(async ({ input }) => {
      return prisma.bounties.findUnique({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
        },
      });
    }),

  isClaimCreated: baseProcedure
    .input(z.object({ chainId: z.number(), id: z.number() }))
    .query(async ({ input }) => {
      return prisma.claims.findUnique({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
        },
      });
    }),

  isBountyCanceled: baseProcedure
    .input(z.object({ chainId: z.number(), id: z.number() }))
    .query(async ({ input }) => {
      return prisma.bounties.findUnique({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
          is_canceled: true,
        },
      });
    }),

  isAcceptedClaim: baseProcedure
    .input(z.object({ chainId: z.number(), id: z.number() }))
    .query(async ({ input }) => {
      return prisma.claims.findUnique({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
          is_accepted: true,
        },
      });
    }),

  isJoinedBounty: baseProcedure
    .input(
      z.object({
        bountyId: z.number(),
        participantAddress: z.string(),
        chainId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return prisma.participationsBounties.findUnique({
        where: {
          user_address_bounty_id_chain_id: {
            bounty_id: input.bountyId,
            user_address: input.participantAddress,
            chain_id: input.chainId,
          },
        },
      });
    }),

  isWithdrawBounty: baseProcedure
    .input(
      z.object({
        bountyId: z.number(),
        participantAddress: z.string(),
        chainId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return prisma.participationsBounties.findUnique({
        where: {
          user_address_bounty_id_chain_id: {
            bounty_id: input.bountyId,
            user_address: input.participantAddress,
            chain_id: input.chainId,
          },
        },
      });
    }),

  isAdmin: baseProcedure
    .input(
      z.object({
        address: addressSchema.optional(),
      })
    )
    .query(({ input }) => {
      return checkIsAdmin(input.address);
    }),

  banBounty: baseProcedure
    .input(
      z.object({
        id: z.number(),
        chainId: z.number(),
        address: addressSchema,
        signature: bytesSchema,
        chainName: chainNameSchema,
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const expectedMessage = getBanSignatureFirstLine({
        id: input.id,
        chainId: input.chainId,
        type: 'bounty',
      });

      if (!input.message.startsWith(expectedMessage)) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Invalid message',
        });
      }

      const isAdmin = checkIsAdmin(input.address);
      const chain = chains[input.chainName];

      if (!isAdmin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authorized to perform this action',
        });
      }

      const isValid = await chain.provider.verifyMessage({
        address: input.address,
        message: input.message,
        signature: input.signature,
      });

      if (!isValid) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Signature is invalid',
        });
      }

      await prisma.bounties.update({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
        },
        data: {
          is_banned: true,
        },
      });
    }),

  banClaim: baseProcedure
    .input(
      z.object({
        id: z.number(),
        chainId: z.number(),
        address: addressSchema,
        signature: bytesSchema,
        chainName: chainNameSchema,
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const expectedMessage = getBanSignatureFirstLine({
        id: input.id,
        chainId: input.chainId,
        type: 'claim',
      });

      if (!input.message.startsWith(expectedMessage)) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Invalid message',
        });
      }

      const isAdmin = checkIsAdmin(input.address);
      const chain = chains[input.chainName];

      if (!isAdmin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authorized to perform this action',
        });
      }

      const isValid = await chain.provider.verifyMessage({
        address: input.address,
        message: input.message,
        signature: input.signature,
      });

      if (!isValid) {
        throw new TRPCError({
          code: 'UNPROCESSABLE_CONTENT',
          message: 'Signature is invalid',
        });
      }

      await prisma.claims.update({
        where: {
          id_chain_id: {
            id: input.id,
            chain_id: input.chainId,
          },
        },
        data: {
          is_banned: true,
        },
      });
    }),
});

export function checkIsAdmin(address?: string) {
  if (!address) {
    return false;
  }
  return serverEnv.ADMINS.includes(address.toLocaleLowerCase());
}

export type AppRouter = typeof appRouter;
