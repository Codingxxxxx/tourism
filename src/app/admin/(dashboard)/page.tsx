export const dynamic = 'force-dynamic';

import { Box, Typography } from '@mui/material';
import { Business, Category } from '@mui/icons-material';
import { getDashboardStatistic } from '@/server/actions/dashboard';

export default async function Page() {
  const data = await getDashboardStatistic();

  return (
    <Box className='p-5' sx={{ display: 'flex', gap: 3 }}>
      <Box className='border border-slate-300 shadow rounded bg-primary' sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4 }}>
        <Business fontSize='large' />
        <Box>
          <Typography fontSize='small'>TOTAL BUSINESS PLACES</Typography>
          <Typography>{data?.listing.total ?? 'N/A'}</Typography>
        </Box>
      </Box>
      <Box className='border border-slate-300 shadow rounded bg-primary' sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4 }}>
        <Category fontSize='large' />
        <Box>
          <Typography fontSize='small'>TOTAL CATEGORIES</Typography>
          <Typography>{data?.category.total ?? 'N/A'}</Typography>
        </Box>
      </Box>
    </Box>
  ) 
}