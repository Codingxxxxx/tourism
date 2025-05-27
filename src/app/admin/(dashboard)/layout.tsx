'use server';

import { ReactNode, Suspense } from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { NextAppProvider } from '@toolpad/core/nextjs';
import LinearProgress from '@mui/material/LinearProgress';
import type { Authentication, Navigation, Session, Branding } from '@toolpad/core/AppProvider';
import { Dashboard, Topic, PeopleAlt, Room, Restaurant } from '@mui/icons-material';
import { logout } from '@/server/actions/auth';
import { redirect} from 'next/navigation';
import { getSessionData } from '@/server/actions/session';
import { DialogsProvider } from '@toolpad/core';

const NAVIGATION: Navigation = [
  /*
  {
    segment: 'admin',
    title: 'Dashboard',
    icon: <Dashboard />
  },
  */
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
  }
];

export async function signOut() {
  await logout();
  redirect('/admin/login');
}

export async function signIn() {
  // signIn logic here
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const sessionData = await getSessionData();

  const session: Session = {
    user: {
      name: sessionData.fullname,
      image: '/admin/user.png',
      email: sessionData.email
    }
  }

  if (sessionData.role.toLowerCase() == 'admin') {
    NAVIGATION.push({
      segment: 'admin/users',
      title: 'Users',
      icon: <PeopleAlt />,
      pattern: 'admin/users(/new)?'
    })
  }


  const branding: Branding = {
    logo: '',
    title: 'Tourism',
    homeUrl: '/admin/destinations',
  };

  const authentication = {
    signOut,
    signIn,
  };

  return (
    <Suspense fallback={<LinearProgress />}>
      <NextAppProvider navigation={NAVIGATION} branding={branding} session={session} authentication={authentication}>
        <DashboardLayout > 
            <DialogsProvider>
              {children}
            </DialogsProvider>
        </DashboardLayout>
      </NextAppProvider>
    </Suspense>
  );
}
