import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'

type Props = {
  videoUrl: string
}

export default function EmbedVideo({ videoUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current) {
      videojs(videoRef.current, {
        autoplay: false,
        controls: true,
        preload: true,
        aspectRatio: '9:16'
      });
    }
  }, []);

  return (
    <video ref={videoRef} className="video-js">
      <source src={videoUrl} type="video/mp4" />
    </video>
  )
}