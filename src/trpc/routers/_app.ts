import { z } from 'zod';

import prisma from 'prisma/prisma';

import { baseProcedure, createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
  bounty: baseProcedure
    .input(z.object({ id: z.string(), chainId: z.string() }))
    .query(async ({ input }) => {
      const bounty = await prisma.bounty.findFirstOrThrow({
        where: {
          primaryId: input.id,
          chainId: input.chainId,
          isBanned: 0,
        },
        include: {
          claims: {
            take: 1,
          },
        },
      });
      return {
        ...bounty,
        id: bounty.primaryId.toString(),
        hasClaims: bounty.claims.length > 0,
        inProgress: Boolean(bounty.inProgress),
        isMultiplayer: Boolean(bounty.isMultiplayer),
        isBanned: Boolean(bounty.isBanned),
        isCanceled: Boolean(bounty.isCanceled),
      };
    }),

  bounties: baseProcedure
    .input(
      z.object({
        chainId: z.string(),
        status: z.enum(['open', 'progress', 'past']),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const items = await prisma.bounty.findMany({
        where: {
          chainId: input.chainId,
          isBanned: 0,
          ...(input.status === 'open'
            ? {
                inProgress: 1,
              }
            : {}),
          ...(input.status === 'progress'
            ? {
                inProgress: 1,
                isVoting: 1,
                deadline: {
                  gte: Date.now() / 1000,
                },
              }
            : {}),
          ...(input.status === 'past'
            ? {
                inProgress: 0,
              }
            : {}),
          ...(input.cursor ? { primaryId: { lt: input.cursor } } : {}),
        },
        include: {
          claims: {
            take: 1,
          },
        },
        orderBy: { primaryId: 'desc' },
        take: input.limit,
      });

      let nextCursor: (typeof items)[number]['primaryId'] | undefined =
        undefined;
      if (items.length === input.limit) {
        nextCursor = items[items.length - 1].primaryId;
      }

      return {
        items,
        nextCursor,
      };
    }),

  participants: baseProcedure
    .input(z.object({ bountyId: z.string(), chainId: z.string() }))
    .query(async ({ input }) => {
      return prisma.participantBounty.findMany({
        select: {
          amount: true,
          user: true,
        },
        where: {
          bountyId: (
            BigInt(input.chainId) * BigInt(100_000) +
            BigInt(input.bountyId)
          ).toString(),
        },
      });
    }),

  bountyClaims: baseProcedure
    .input(
      z.object({
        bountyId: z.string(),
        chainId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ input }) => {
      const items = await prisma.claim.findMany({
        where: {
          bountyId: (
            BigInt(input.chainId) * BigInt(100_000) +
            BigInt(input.bountyId)
          ).toString(),
          isBanned: 0,
          ...(input.cursor ? { primaryId: { lt: input.cursor } } : {}),
        },
        orderBy: { primaryId: 'desc' },
        take: input.limit,
        select: {
          primaryId: true,
          issuer: true,
          bountyId: true,
          title: true,
          description: true,
          createdAt: true,
          accepted: true,
          url: true,
        },
      });

      let nextCursor: (typeof items)[number]['primaryId'] | undefined =
        undefined;
      if (items.length === input.limit) {
        nextCursor = items[items.length - 1].primaryId;
      }

      return {
        items,
        nextCursor,
      };
    }),

  claim: baseProcedure
    .input(z.object({ claimId: z.string(), chainId: z.string() }))
    .query(async ({ input }) => {
      return prisma.claim.findFirstOrThrow({
        where: {
          primaryId: input.claimId,
          chainId: input.chainId,
          isBanned: 0,
        },
        select: {
          primaryId: true,
          issuer: true,
          bountyId: true,
          title: true,
          description: true,
          createdAt: true,
          accepted: true,
          url: true,
        },
      });
    }),

  userBounties: baseProcedure
    .input(z.object({ address: z.string(), chainId: z.string() }))
    .query(async ({ input }) => {
      const bounties = await prisma.bounty.findMany({
        where: {
          issuer: input.address,
          chainId: input.chainId,
          isBanned: 0,
          isCanceled: null,
        },
        select: {
          primaryId: true,
          title: true,
          description: true,
          chainId: true,
          amount: true,
          isMultiplayer: true,
          inProgress: true,
          claims: {
            take: 1,
          },
        },

        orderBy: { primaryId: 'asc' },
      });

      return bounties.map((bounty) => ({
        id: bounty.primaryId.toString(),
        title: bounty.title,
        description: bounty.description,
        network: bounty.chainId.toString(),
        amount: bounty.amount,
        isMultiplayer: Boolean(bounty.isMultiplayer),
        inProgress: Boolean(bounty.inProgress),
        hasClaims: bounty.claims.length > 0,
      }));
    }),

  userClaims: baseProcedure
    .input(z.object({ address: z.string(), chainId: z.string() }))
    .query(async ({ input }) => {
      return prisma.claim.findMany({
        where: {
          issuer: {
            id: input.address,
          },
          chainId: input.chainId,
          isBanned: 0,
        },
        select: {
          primaryId: true,
          title: true,
          description: true,
          createdAt: true,
          accepted: true,
          url: true,
          bounty: {
            select: {
              primaryId: true,
              amount: true,
            },
          },
          issuer: true,
          ownerId: true,
        },
        orderBy: { primaryId: 'asc' },
      });
    }),

  userNFTs: baseProcedure
    .input(z.object({ address: z.string(), chainId: z.string() }))
    .query(async ({ input }) => {
      const NFTs = await prisma.claim.findMany({
        where: {
          ownerId: input.address,
          chainId: input.chainId,
        },
        select: {
          primaryId: true,
          url: true,
          title: true,
          description: true,
          bounty: {
            select: {
              primaryId: true,
            },
          },
        },
        orderBy: { primaryId: 'asc' },
      });
      return NFTs.map((NFT) => ({
        id: NFT.primaryId.toString(),
        url: NFT.url,
        title: NFT.title,
        description: NFT.description,
        bountyId: NFT.bounty.primaryId.toString(),
      }));
    }),

  cancelBounty: baseProcedure
    .input(z.object({ bountyId: z.string(), chainId: z.string() }))
    .mutation(async ({ input }) => {
      const bounty = await prisma.bounty.findFirstOrThrow({
        where: {
          primaryId: input.bountyId,
          chainId: input.chainId,
        },
      });

      await prisma.bounty.updateMany({
        where: {
          id: bounty.id,
        },
        data: {
          isCanceled: 1,
          inProgress: 0,
        },
      });
    }),

  acceptClaim: baseProcedure
    .input(
      z.object({
        bountyId: z.string(),
        claimId: z.string(),
        chainId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const claim = await prisma.claim.findFirstOrThrow({
        where: {
          primaryId: input.claimId,
          chainId: input.chainId,
        },
      });

      const bounty = await prisma.bounty.findFirstOrThrow({
        where: {
          primaryId: input.bountyId,
          chainId: input.chainId,
        },
      });

      await prisma.bounty.updateMany({
        where: {
          id: bounty.id,
        },
        data: {
          inProgress: 0,
        },
      });

      await prisma.claim.updateMany({
        where: {
          id: claim.id,
        },
        data: {
          accepted: 1,
        },
      });
    }),
});

export type AppRouter = typeof appRouter;
