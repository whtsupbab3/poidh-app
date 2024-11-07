import React, { useState } from 'react';

import FormJoinBounty from '@/components/global/FormJoinBounty';
import ButtonCTA from '@/components/ui/ButtonCTA';

export default function JoinBounty({ bountyId }: { bountyId: string }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <FormJoinBounty
        bountyId={bountyId}
        open={showForm}
        onClose={() => setShowForm(false)}
      />
      <div className=' py-12 w-fit'>
        <div onClick={() => setShowForm(true)}>
          <ButtonCTA> join bounty </ButtonCTA>
        </div>
      </div>
    </>
  );
}
