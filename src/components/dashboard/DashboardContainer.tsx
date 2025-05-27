import { PageContainer, PageHeaderProps } from '@toolpad/core';
import CustomHeader from './CustomHeader';
import { ReactNode, useEffect, useState } from 'react';
import { Backdrop, Box, CircularProgress } from '@mui/material';
import { useApiHandlerStore } from '@/stores/useApiHandlerStore';
import { useRouter } from 'next/navigation';
import { logout } from '@/server/actions/auth';

type DashboardContainerProps = PageHeaderProps & {
  children: ReactNode
}

export default function DashboardContainer({ children, breadcrumbs, title }: DashboardContainerProps) {
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const sessionExpired = useApiHandlerStore((state) => state.isSessionExpired);
  const router = useRouter();

  const signOut = async () => {
    await logout()
    setOpenBackdrop(true);
    router.push('/admin/login')
  }

  useEffect(() => {
    if (!sessionExpired) return;
    signOut();
  }, [sessionExpired]);

  return (
    <PageContainer 
      slotProps={{ header: { title, breadcrumbs: breadcrumbs } }} 
      slots={{ header: CustomHeader }}
    >
      <Box sx={{ marginTop: 2 }}>
        {children}
      </Box>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </PageContainer>
  )
}