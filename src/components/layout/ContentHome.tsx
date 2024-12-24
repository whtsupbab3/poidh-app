'use-client';

import { useState } from 'react';

import { useGetChain } from '@/hooks/useGetChain';
import { trpc } from '@/trpc/client';
import BountyList from '@/components/ui/BountyList';
import { cn } from '@/utils';
import { FormControl, MenuItem, Select } from '@mui/material';
import { SortIcon } from '@/components/global/Icons';

type DisplayType = 'open' | 'progress' | 'past';
type SortType = 'value' | 'id';

export default function ContentHome() {
  const [display, setDisplay] = useState<DisplayType>('open');
  const [sortType, setSortType] = useState<SortType>('value');
  const chain = useGetChain();

  const bounties = trpc.bounties.useInfiniteQuery(
    {
      chainId: chain.id,
      status: display,
      limit: 6,
      sortType,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <>
      <div className='z-1 flex flex-wrap container mx-auto border-b border-white hover:border-white py-6 md:py-12 sm:py-8 w-full items-center px-8'>
        <div className='hidden md:flex flex-1'></div>
        <div className='w-full md:w-auto flex justify-center'>
          <div
            id='btn-container'
            className={cn(
              'flex flex-nowrap border border-white rounded-full transition-all bg-gradient-to-r h-[42px]',
              'md:text-base sm:text-sm text-xs',
              display == 'open' && 'from-red-500 to-40%',
              display == 'progress' &&
                'via-red-500 from-transparent to-transparent from-[23.33%] to-[76.66%]',
              display == 'past' && 'from-transparent from-60% to-red-500',
              'gap-2 md:gap-4'
            )}
          >
            <button
              onClick={() => setDisplay('open')}
              className='flex-grow sm:flex-grow-0 md:px-5 px-3 h-full flex items-center justify-center'
            >
              new bounties
            </button>
            <button
              onClick={() => setDisplay('progress')}
              className='flex-grow sm:flex-grow-0 md:px-5 px-3 h-full flex items-center justify-center'
            >
              voting in progress
            </button>
            <button
              onClick={() => setDisplay('past')}
              className='flex-grow sm:flex-grow-0 md:px-5 px-3 h-full flex items-center justify-center'
            >
              past bounties
            </button>
          </div>
        </div>
        <div className='w-full md:w-auto flex justify-center md:justify-end mt-2 md:mt-0 md:flex-1 ml-3'>
          <FormControl className='h-[36px] md:h-[42px]'>
            <Select
              id='sort-select'
              value={sortType}
              className='h-full py-0 bg-[#D1ECFF]/20 text-bold bg-gradient-to-t from-white-200 from-10% via-30% to-50% rounded-full hover:border-white'
              sx={{
                color: 'white',
                '& .MuiSvgIcon-root': { color: 'white' },
                '& fieldset': {
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white !important',
                  },
                },
                '& .MuiSelect-select': {
                  padding: '0 32px 0 12px !important',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px',
                  minHeight: '36px',
                  '@media (min-width: 768px)': {
                    minHeight: '42px',
                  },
                },
                '&:hover': {
                  '& fieldset': {
                    borderColor: 'white !important',
                  },
                },
                '&.Mui-focused': {
                  '& fieldset': {
                    borderColor: 'white !important',
                  },
                },
              }}
              renderValue={() => <SortIcon width={18} height={18} />}
              onChange={(e) => setSortType(e.target.value as SortType)}
            >
              <MenuItem value='value' className='color-white'>
                by value
              </MenuItem>
              {/* id == date */}
              <MenuItem value='id' className='color-white'>
                by date
              </MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>

      <div className='pb-20 z-1'>
        {bounties.data && (
          <BountyList
            bounties={bounties.data.pages.flatMap((page) =>
              page.items.map((bounty) => ({
                id: bounty.id.toString(),
                title: bounty.title,
                description: bounty.description,
                amount: bounty.amount,
                isMultiplayer: bounty.is_multiplayer || false,
                inProgress: bounty.in_progress || false,
                hasClaims: bounty.claims.length > 0,
                network: chain.slug,
              }))
            )}
          />
        )}
      </div>
      {bounties.hasNextPage && (
        <div className='flex justify-center items-center pb-96'>
          <button
            className='border border-white rounded-full px-5  backdrop-blur-sm bg-[#D1ECFF]/20  py-2'
            onClick={() => bounties.fetchNextPage()}
            disabled={bounties.isFetchingNextPage}
          >
            {bounties.isFetchingNextPage ? 'loading...' : 'show more'}
          </button>
        </div>
      )}
    </>
  );
}
