import Image from 'next/image'
import Link from 'next/link'
import { Box, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

export default function NotFound() {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Image 
        src='/not_found.svg' 
        width={600} 
        height={400} 
        objectFit='cover' 
        alt='not found' 
      />
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Button 
        variant='contained' 
        LinkComponent={Link} 
        startIcon={<ArrowBack />} 
        href='/'
        sx={{
          marginTop: 3
        }}
      >
        Return Home
      </Button>
    </Box>
  )
}