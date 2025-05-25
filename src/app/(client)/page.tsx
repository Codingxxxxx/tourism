'use client';
import Image from "next/image";
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Category, PaginationParamters } from '@/shared/types/dto';
import { getDisplayCategories } from '@/server/actions/web/home';
import { withServerHandler } from "@/shared/utils/apiUtils";
import { ServerResponse, PaginatedDisplayCategories } from '@/shared/types/serverActions';
import { CustomBackdrop } from '@/components/Backdrop';
import { Box } from '@mui/material';
import { getImagePath } from '@/shared/utils/fileUtils';


const NO_IMAGE = '/no_category.jpg';
const DEFAULT_VIDEO = 'samples/hotel.mp4';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPending, startTransition] = useTransition()
  const [serverResponse, setServerResponse] = useState<ServerResponse<PaginatedDisplayCategories>>();
 
  useEffect(() => {
    startTransition(async () => {
      setServerResponse(await getDisplayCategories({
        limit: 15,
        offset: 0
      }));
    });
  }, []);

  useEffect(() => {
    if (isPending || !videoRef.current) return;
    videojs(videoRef.current, {
      autoplay: false,
      controls: true,
      preload: true,
      aspectRatio: '9:16'
    });
  }, [isPending, videoRef]);

  return (
    <>
    <div className="bg-gray-300 min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-screen flex flex-col">
        {/* Main Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Hero Section - 100vh height with 9:16 ratio */}
          <div
            className="bg-blue-500 shadow-lg relative flex items-center justify-center text-white w-full md:w-[56.25vh]"
            style={{
              height: '100vh',
              minHeight: '100vh',
            }}
          >
            <video ref={videoRef} className="video-js">
              <source src={serverResponse?.data?.videoCategory?.video || DEFAULT_VIDEO} type="video/mp4" />
            </video>
          </div>

          {/* Right Side Grid (Smaller Cards) */}
          <div className="flex-1 pl-[.025rem] overflow-auto h-screen">
            <div className="grid grid-cols-3 grid-rows-2 gap-[.025rem] h-full">
              {serverResponse?.data?.categories
                .filter(category => !category.isFront)
                .slice(0, 6)
                .map((category, idx) => (
                  <Link key={idx} href={`/category/${encodeURIComponent(category.name)}/${category.id}`}>
                    <div className="relative w-full h-full">
                      <Image
                        src={category.photo ? getImagePath(category.photo) : NO_IMAGE}
                        alt={category.name}
                        fill
                        className="object-cover brightness-60"
                        onError={(e) => (e.currentTarget.src = NO_IMAGE)}
                      />
                      <h3
                        className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white text-center shadow-md drop-shadow-lg"
                        dangerouslySetInnerHTML={{
                          __html: category.name.replace(/\n/g, '<br>'),
                        }}
                      />
                    </div>
                  </Link>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
    <CustomBackdrop open={isPending} />
    </>
  );
}
