'use client'

import { ReactNode, Suspense, useMemo, useState } from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import type { Navigation, Session } from '@toolpad/core/AppProvider';
import { Dashboard, Topic, PeopleAlt, Room, Add, List } from '@mui/icons-material';
import { Box } from '@mui/material';
import { PageContainer, PageHeader } from '@toolpad/core';
import CustomHeader from '@/components/dashboard/CustomHeader';

const NAVIGATION: Navigation = [
  {
    segment: 'admin',
    title: 'Dashboard',
    icon: <Dashboard />,
  },
  {
    segment: 'admin/topic',
    title: 'Topic',
    icon: <Topic />
  },
  {
    segment: 'admin/locations',
    title: 'Location',
    icon: <Room />
  },
  {
    segment: 'admin/users',
    title: 'User',
    icon: <PeopleAlt />,
    pattern: 'admin/users(/new)?'
  },
];

const demoSession = {
  user: {
    name: 'Rotha',
    email: 'bharatkashyap@outlook.com',
    image: 'https://avatars.githubusercontent.com/u/19550456',
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(demoSession);

  const branding = {
    logo: <img src="https://mui.com/static/logo.png" alt="MUI logo" />,
    title: 'MUI',
    homeUrl: '/toolpad/core/introduction',
  };

  const authentication = useMemo(() => {
    return {
      signIn: () => {
        setSession(demoSession);
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  return (
    <Suspense fallback={<LinearProgress />}>
      <NextAppProvider navigation={NAVIGATION} branding={branding} session={session} authentication={authentication}>
        <DashboardLayout>
            {children}
        </DashboardLayout>
      </NextAppProvider>
    </Suspense>
  );
}
