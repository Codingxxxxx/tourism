'use client';
import Image from "next/image";
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
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

  const categories = [
    {
      text: 'Kampot \n Recommends 2025',
      image: 'kampot-recommend.jpg'
    },
    {
      text: 'Tourism Destination',
      image: 'pagoda.jpg'
    },
    {
      text: 'Stay',
      image: 'stay.jpg'
    },
    {
      text: 'Eat / Drink',
      image: 'khmer-food.jpg'
    },
    {
      text: 'Coffee',
      image: 'coffee.jpg'
    },
    {
      text: 'Things to Do',
      image: 'activity.jpg'
    },
    {
      text: 'Massage & Steam',
      image: 'massage.jpg'
    },
    {
      text: 'Exercise',
      image: 'exercise.jpg'
    },
    {
      text: 'Market Shopping',
      image: 'market.jpg'
    },
    {
      text: 'Deals and Offers',
      image: 'deal.jpg'
    },
    {
      text: 'Transportation',
      image: 'cambodia-train.jpg'
    },
    {
      text: 'Video Inspiration',
      image: 'kampot.jpg'
    }
  ];

  return (
    <div className="bg-gray-300 min-h-screen">
      {/* Main Container with 100vh */}
      <div className="container-full h-[100vh] flex flex-col">
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
              <source src='samples/hotel.mp4' type="video/mp4" />
            </video>
          </div>

          {/* Right Side Grid (Smaller Cards) */}
          <div className="flex-1 pl-[.125rem] overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[.125rem] h-full">
                {categories.map((category, idx) => (
                  <Link href={`/category/${encodeURIComponent(category.text)}`} className="relative">
                    <div className='relative aspect-[16/9] overflow-hidden shadow filter brightness-70'>
                      <Image style={{ objectFit: 'cover' }} src={`/samples/${category.image}`} alt={category.text}  fill />
                    </div>
                    <h3 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-white text-center shadow-md z-1" dangerouslySetInnerHTML={{ __html: category.text.replace('\n', '<br>') }}></h3>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
