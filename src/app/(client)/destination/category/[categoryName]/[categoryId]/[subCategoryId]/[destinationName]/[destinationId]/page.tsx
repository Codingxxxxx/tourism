'use client'

import { useEffect, useRef, useState, useTransition } from "react";
import { useParams } from 'next/navigation';
import { Box, Button, IconButton, Link as MuiLink } from '@mui/material';
import { Breadcrumbs, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { getListingBySubCategoryId } from '@/server/actions/web/home';
import { CustomBackdrop } from '@/components/Backdrop';
import { Destination } from '@/shared/types/dto';
import DestinationDetails from '@/components/desktop/DestinationDetails';
import { ArrowBack } from '@mui/icons-material';
import Link from 'next/link';

type PageParams = {
  destinationName: string,
  destinationId: string,
  categoryName: string,
  categoryId: string,
  subCategoryId: string
}

export default function Page() {
  const params = useParams<PageParams>();
  const [isPending, startTransition] = useTransition();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeDestination, setActiveDestination] = useState<Destination>(); // current destination that user viewing on map
  const backLink = `/category/${decodeURIComponent(params.categoryName)}/${params.categoryId}`;

  const onDestinationChanged = (destination: Destination) =>  {
    setActiveDestination(destination);
  };

  // load google map API script
  useEffect(() => {
    startTransition(async () => {
      const { data, success, message } = await getListingBySubCategoryId(params.subCategoryId);
      if (!success) console.error(message);
      if (!data) return;

      // sort the category where clicked destination go to top
      const idx = data.findIndex(dest => String(dest.id) === params.destinationId);
      const firstDestination = data.splice(idx, 1)[0];

      // set the active destination to first
      data.unshift(firstDestination);
      setDestinations(data);
    });
  }, []); 

  return (
    <div className="min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-[100vh] flex flex-col overflow-hidden">
        {/* header */}
        <Box 
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          className='p-3 md:p-4 bg-blue-700' 
        >
          <Breadcrumbs 
            aria-label='breadcrumb'
            separator={false}
          >
            <MuiLink sx={{ display: 'flex', alignItems: 'center', color: 'primary' }} underline='hover' href='/'>
              <HomeIcon className='text-slate-100' sx={{ mr: 1 }} />
              <span className='text-slate-100 text-sm md:text-base'>Home</span>
            </MuiLink>
            <span className="text-slate-100">/</span>
            <MuiLink underline='hover' href={backLink}>
              <span className='text-sm md:text-base text-slate-100 w-[17ch] md:w-auto overflow-hidden whitespace-nowrap text-ellipsis'>{decodeURIComponent(params.categoryName)}</span>
            </MuiLink>
            <Box
              sx={{
                  display: {
                    xs: 'none',
                    sm: 'flex'
                  },
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
            >
              <span className="text-slate-100">/</span>
              <span className='block ml-3 text-slate-100'>{activeDestination ? activeDestination.name : decodeURIComponent(params.destinationName)}</span>
            </Box>
          </Breadcrumbs>
          {/* Back button */}
          <Button
            sx={{
              alignSelf: 'flex-end',
              display: {
                xs: 'flex',
                md: 'none'
              }
            }} 
            href={backLink}
            LinkComponent={Link}
            variant='contained' 
            size='small' 
            color='warning' 
            startIcon={<ArrowBack fontSize='small' />}
          >
            Back
          </Button>
        </Box>
        {!isPending && destinations.length > 0 && <DestinationDetails destinations={destinations} onDestinationChanged={onDestinationChanged} />}
      </div>
      <CustomBackdrop open={isPending} />
    </div>
  )
}