'use client';
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getDisplayCategories } from '@/server/actions/web/home';
import { ServerResponse, PaginatedDisplayCategories } from '@/shared/types/serverActions';
import { CustomBackdrop } from '@/components/Backdrop';
import { getImagePath } from '@/shared/utils/fileUtils';
import EmbedCode from '@/components/EmbedCode';
import SkeletonVideo from '@/components/SkeletonVideo';
import EmbedVideo from '@/components/EmbedVideo';
import EmbedIframe from '@/components/EmbedIframe';

const NO_IMAGE = '/no_category.jpg';
const URL_REGEX = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?(\?[^\s]*)?$/;

export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [serverResponse, setServerResponse] = useState<ServerResponse<PaginatedDisplayCategories>>();
  const [videoType, setVideoType] = useState<'VIDEO_URL' | 'EMBED_URL' | 'EMBED_CODE' | ''>('');
  const [video, setVideo] = useState<string>('');

  useEffect(() => {
    startTransition(async () => {
      const result = await getDisplayCategories({ limit: 15, offset: 0 });
      setServerResponse(result);

      const videoUrl = result.data?.videoCategory?.video;
      if (!videoUrl) return;

      const isVideoFile = /https?:\/\/[^\/]+\/.*\/[\w\-]+\.(mp4|webm|mov|avi)/i.test(videoUrl);

      if (isVideoFile) {
        setVideoType('VIDEO_URL');
      } else if (URL_REGEX.test(videoUrl)) {
        setVideoType('EMBED_URL');
      } else {
        setVideoType('EMBED_CODE');
      }

      setVideo(videoUrl);
    });
  }, []);

  return (
    <>
      <div className="bg-gray-300 min-h-screen">
        <div className="container-full flex flex-col sm:flex-row h-screen overflow-hidden">

          {/* Categories: on top for xs, on right for sm+ */}
          <div className="order-1 w-full sm:order-2 sm:flex-1 overflow-auto h-[40vh] sm:h-screen">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-[0.025rem] h-full">
              {serverResponse?.data?.categories.slice(0, 6).map((category, idx) => (
                <Link
                  key={idx}
                  href={`/category/${encodeURIComponent(category.name)}/${category.id}`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={category.photo ? getImagePath(category.photo) : NO_IMAGE}
                      alt={category.name}
                      fill
                      className="object-cover brightness-60"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = NO_IMAGE;
                      }}
                    />
                    <h3
                      className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm sm:text-xl font-bold text-white text-center shadow-md drop-shadow-lg"
                      dangerouslySetInnerHTML={{
                        __html: category.name.replace(/\n/g, '<br>'),
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Video: below categories on xs, left on sm+ */}
          <div className="order-2 w-full sm:order-1 sm:w-[56.25vh] h-[60vh] sm:h-screen flex items-center justify-center relative text-white shadow-lg">
            {videoType === 'EMBED_CODE' && <EmbedCode code={video} />}
            {videoType === 'EMBED_URL' && <EmbedIframe url={video} />}
            {videoType === 'VIDEO_URL' && <EmbedVideo videoUrl={video} />}
            {(serverResponse && !isPending) || !video && <SkeletonVideo />}
          </div>

        </div>
      </div>
      <CustomBackdrop open={isPending} />
    </>
  );
}
