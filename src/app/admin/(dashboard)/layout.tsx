'use client'

import { ReactNode, Suspense, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import type { Authentication, Navigation, Session } from '@toolpad/core/AppProvider';
import { Dashboard, Topic, PeopleAlt, Room, Restaurant } from '@mui/icons-material';
import { logout } from '@/server/actions/auth';
import { useRouter } from 'next/navigation';
import { Backdrop, CircularProgress } from '@mui/material';
import { useApiHandlerStore } from '@/stores/useApiHandlerStore';
import { getSessionData } from '@/server/actions/session';

const NAVIGATION: Navigation = [
  {
    segment: 'admin',
    title: 'Dashboard',
    icon: <Dashboard />
  },
  {
    segment: 'admin/destinations',
    title: 'Destinations',
    icon: <Restaurant />,
    pattern: 'admin/destinations(/new)?'
  },
  {
    segment: 'admin/categories',
    title: 'Categories',
    icon: <Topic />,
    pattern: 'admin/categories(/new)?'
  },
  {
    segment: 'admin/locations',
    title: 'Locations',
    icon: <Room />,
    pattern: 'admin/locations(/new)?'
  },
  {
    segment: 'admin/users',
    title: 'Users',
    icon: <PeopleAlt />,
    pattern: 'admin/users(/new)?'
  }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const sessionExpired = useApiHandlerStore((state) => state.isSessionExpired);
  const router = useRouter();
  const [session, setSession] = useState<Session>();

  const branding = {
    logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
    title: 'MUI',
    homeUrl: '/toolpad/core/introduction',
  };

  async function signOut() {
    setOpenBackdrop(true);
    await logout()
    router.push('/admin/login')
  }

  useEffect(() => {
    getSessionData()
      .then(sessionData => {
        setSession({
          user: {
            name: sessionData.fullname,
            image: 'https://avatars.githubusercontent.com/u/19550456',
            email: sessionData.email
          }
        })
      });
  }, []);

  useEffect(() => {
    if (!sessionExpired) return;
    signOut();
  }, [sessionExpired]);

  const authentication: Authentication = useMemo(() => {
    return {
      signOut: async () => {
        signOut();
      },
      signIn: () => {},

    };
  }, []);

  return (
    <Suspense fallback={<LinearProgress />}>
      <NextAppProvider navigation={NAVIGATION} branding={branding} session={session} authentication={authentication}>
        <DashboardLayout > 
            {children}
        </DashboardLayout>
        {/* backdrop */}
        <Backdrop
          sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
          open={openBackdrop}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </NextAppProvider>
    </Suspense>
  );
}
