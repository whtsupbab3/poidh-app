import NetworkSelector from '@/components/global/NetworkSelector';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

import React from 'react';

export default function ConnectWallet() {
  return (
    <div className='flex flex-row gap-2'>
      <div className='hidden lg:block'>
        <NetworkSelector width={24} height={24} />
      </div>
      <div className='w-[90px] mt-[3px]'>
        <DynamicWidget
          innerButtonComponent={<div>connect</div>}
          variant='modal'
        />
      </div>
    </div>
  );
}
