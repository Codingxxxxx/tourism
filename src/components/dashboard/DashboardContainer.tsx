import { PageContainer, PageHeaderProps } from '@toolpad/core';
import CustomHeader from './CustomHeader';
import { ReactNode } from 'react';
import { Box } from '@mui/material';

type DashboardContainerProps = PageHeaderProps & {
  children: ReactNode
}

export default function DashboardContainer({ children, breadcrumbs, title }: DashboardContainerProps) {
  return (
    <PageContainer 
      slotProps={{ header: { title, breadcrumbs: breadcrumbs } }} 
      slots={{ header: CustomHeader }}
    >
      <Box sx={{ marginTop: 2 }}>
        {children}
      </Box>
    </PageContainer>
  )
}