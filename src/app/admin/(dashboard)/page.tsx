'use client';

import { Box, Typography } from '@mui/material';
import { Business, Category } from '@mui/icons-material';
import { getDashboardStatistic } from '@/server/actions/dashboard';
import { useEffect, useState, useTransition } from 'react';
import { DashboardStatistic } from '@/shared/types/dto';
import { handleServerAction } from '@/shared/utils/apiUtils';
import { CustomBackdrop } from '@/components/Backdrop';

export default function Page() {
  const [dashboard, setDashboard] = useState<DashboardStatistic>();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const response = await handleServerAction(getDashboardStatistic)
      setDashboard(response.data);
    })
  }, []);

  return (
    <Box className='p-5' sx={{ display: 'flex', gap: 3 }}>
      <Box className='border border-slate-300 shadow rounded bg-primary' sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4 }}>
        <Business fontSize='large' />
        <Box>
          <Typography fontSize='small'>TOTAL BUSINESS PLACES</Typography>
          <Typography>{dashboard?.listing.total ?? 'N/A'}</Typography>
        </Box>
      </Box>
      <Box className='border border-slate-300 shadow rounded bg-primary' sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4 }}>
        <Category fontSize='large' />
        <Box>
          <Typography fontSize='small'>TOTAL CATEGORIES</Typography>
          <Typography>{dashboard?.category.total ?? 'N/A'}</Typography>
        </Box>
      </Box>
      <CustomBackdrop open={pending} />
    </Box>
  )
}