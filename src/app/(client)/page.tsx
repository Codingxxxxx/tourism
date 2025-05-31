'use client';
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { getDisplayCategories } from '@/server/actions/web/home';
import { ServerResponse, PaginatedDisplayCategories } from '@/shared/types/serverActions';
import { CustomBackdrop } from '@/components/Backdrop';
import { getImagePath } from '@/shared/utils/fileUtils';
import EmbedCode from '@/components/EmbedCode'
import SkeletonVideo from '@/components/SkeletonVideo';
import EmbedVideo from '@/components/EmbedVideo';
import EmbedIframe from '@/components/EmbedIframe';

const NO_IMAGE = '/no_category.jpg';
const DEFAULT_VIDEO = 'samples/hotel.mp4';

export default function Home() {
  const [isPending, startTransition] = useTransition()
  const [serverResponse, setServerResponse] = useState<ServerResponse<PaginatedDisplayCategories>>();
  const [videoType, setVideoType] = useState('');
  const [video, setVideo] = useState('');
 
  useEffect(() => {
    startTransition(async () => {
      const result = await getDisplayCategories({
        limit: 15,
        offset: 0
      });

      setServerResponse(result);

      if (!result.data?.videoCategory?.video) return;

      const isLink = /https?:\/\/[^\/]+\/.*\/[\w\-]+\.(mp4|webm|mov|avi)/i.test(result.data?.videoCategory?.video);

      if (isLink) {
        setVideoType('VIDEO_URL');
      } else if (result.data?.videoCategory?.video) {
        setVideoType('EMBED_URL');
      } else {
        setVideoType('EMBED_CODE');
      }
    });
  }, []);


  return (
    <>
    <div className="bg-gray-300 min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-screen flex flex-col">
        {/* Main Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Hero Section - 100vh height with 9:16 ratio */}
          <div
            className="shadow-lg relative flex items-center justify-center text-white w-full md:w-[56.25vh]"
            style={{
              height: '100vh',
              minHeight: '100vh',
            }}
          >
            {video && videoType === 'EMBED_CODE' && <EmbedCode code={video} />}
            {video && videoType === 'EMBED_URL' && <EmbedIframe url={video} />}
            {video && videoType === 'VIDEO_URL' && <EmbedVideo videoUrl={video} />}
            {serverResponse && !isPending && !video && <SkeletonVideo />}
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
