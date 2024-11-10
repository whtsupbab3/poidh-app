import { Backdrop, CircularProgress } from '@mui/material';

export default function Loading({
  open,
  status,
}: {
  open: boolean;
  status: string;
}) {
  return (
    <div>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        className='flex flex-col'
      >
        <p>{status}</p>
        <CircularProgress color='inherit' className='mt-4' />
      </Backdrop>
    </div>
  );
}
