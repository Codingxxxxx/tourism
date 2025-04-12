import { PageHeaderProps, useActivePage } from '@toolpad/core';
import { Box, Breadcrumbs, Typography, Link } from '@mui/material';

export default function CustomHeader({ title, breadcrumbs }: PageHeaderProps) {
  const activePage = useActivePage();
  const breadcrumbsData = breadcrumbs || activePage?.breadcrumbs

  return (
    <Box>
      <Typography variant='h6'>{title || activePage?.title}</Typography>
      <Breadcrumbs aria-label="breadcrumb">
        {breadcrumbsData && breadcrumbsData.map(item => <Link color='inherit' underline='hover' href={item.path}>{item.title}</Link>)}
      </Breadcrumbs>
    </Box>
  )
}