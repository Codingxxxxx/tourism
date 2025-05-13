'use client'

import { ReactNode, Suspense, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import type { Navigation, Session } from '@toolpad/core/AppProvider';
import { Dashboard, Topic, PeopleAlt, Room, Add, List } from '@mui/icons-material';
import { logout } from '@/server/actions/auth';
import { getSessionData } from '@/server/actions/session';
import { redirect } from 'next/navigation';
import { Backdrop, CircularProgress } from '@mui/material';

const NAVIGATION: Navigation = [
  {
    segment: 'admin',
    title: 'Dashboard',
    icon: <Dashboard />,
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
    icon: <Room />
  },
  {
    segment: 'admin/users',
    title: 'Users',
    icon: <PeopleAlt />,
    pattern: 'admin/users(/new)?'
  }
];

const demoSession = {
  user: {
    name: 'Rotha',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>();
  const [openBackdrop, setOpenBackdrop] = useState(false);

  const branding = {
    logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
    title: 'MUI',
    homeUrl: '/toolpad/core/introduction',
  };

  const authentication = useMemo(() => {
    return {
      signOut: async () => {
        setOpenBackdrop(true);
        await logout()
        setSession(null)
        redirect('/admin/login')
      },
      signIn: () => {
      }
    };
  }, []);

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

  return (
    <Suspense fallback={<LinearProgress />}>
      <NextAppProvider navigation={NAVIGATION} branding={branding} session={session} authentication={authentication}>
        <DashboardLayout>
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
