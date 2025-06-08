import { forwardRef, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { useMediaQuery } from '@mui/material';

type Props = {
  open?: boolean,
  apiKey: string,
  lat: number;
  lng: number;
  placeId?: string,
  placeName: string,
  onClose: () => void
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DestinationDirection({ open = false, lat, lng, placeId, apiKey, placeName, onClose }: Props) {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isBelowMd = useMediaQuery((theme) => theme.breakpoints.down('md'));

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position)
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = placeId
            ? `place_id:${placeId}`   // preferred if available
            : `${lat},${lng}`;

          const src = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destination}&mode=driving&language=en&zoom=${isBelowMd ? 9 : 10}`;
          setIframeSrc(src);
        },
        (err) => {
          setError(`Failed to get location: ${err.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported.');
    }
  }, []);

  return (
    <Dialog
      fullScreen
      open={open}
      slots={{ transition: Transition }}
    >
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="close"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
          <Typography 
            sx={{ ml: 2, flex: 1 }}
          >
            {placeName}
          </Typography>
        </Toolbar>
      </AppBar>
      {!iframeSrc ? error || 'Loading information...' : <iframe style={{ border: '0' }} referrerPolicy="no-referrer-when-downgrade" src={iframeSrc} allowFullScreen height='100%' />}
    </Dialog>
  );
}