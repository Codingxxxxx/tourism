'use client'
import Image from 'next/image';
import Link from 'next/link'
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { useEffect, useRef, useState } from "react";
import { useParams } from 'next/navigation';

export default function Page() {
  const params = useParams();
  const slug = params.slug || '';
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [subCategories, setSubCategories] = useState<{title: string, image: string}[]>([]);
  function shuffleArray(array: Array<{ title: string, image: string }>) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

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

  useEffect(() => {
    setSubCategories(shuffleArray([
      { title: "Shrimp Catching at night", image: 'food.jpg' },
      { title: "Top 5 budget stays", image: 'hotelroom.jpg' },
      { title: "1 day trip itinerary for solo traveler", image: 'beach.jpg' },
      { title: "Trending Camping location", image: 'camping.jpg' },
      { title: "Top 5 location for Relaxing seeker", image: 'relax.jpg' },
      { title: "Top 5 local foods", image: 'cambodian-cake.jpg' },
      { title: "Top 3 Waterfall in Kampot", image: 'waterfall.jpg' },
      { title: "Firefly Cruise", image: 'lake.jpg' },
      { title: "Visit Salt Fields", image: 'salt.jpg' },
      { title: "Experience Kampot Crab Market", image: 'crab.jpg' },
      { title: "La Plantation - Famous Pepper farm", image: 'chilli.jpg' },
      { title: "phnom chhnok cave", image: 'cave.jpg' },
      { title: "Top 3 Waterfall in Kampot", image: 'waterfall.jpg' },
      { title: "Firefly Cruise", image: 'lake.jpg' },
      { title: "Visit Salt Fields", image: 'salt.jpg' },
      { title: "Experience Kampot Crab Market", image: 'crab.jpg' },
      { title: "La Plantation - Famous Pepper farm", image: 'chilli.jpg' },
      { title: "phnom chhnok cave", image: 'cave.jpg' },
      { title: "La Plantation - Famous Pepper farm", image: 'chilli.jpg' },
      { title: "phnom chhnok cave", image: 'cave.jpg' }
]));
  }, []);


  return (
    <div className="min-h-screen">
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
              <source src='/samples/hotel.mp4' type="video/mp4" />
            </video>
          </div>

          {/* Right Side Grid (Smaller Cards) */}
          <div className="flex-1 pl-2 overflow-auto">
            <header className='p-4 bg-blue-500 text-white rounded-bl'>
              <Link href="/">Home</Link> / {decodeURIComponent(slug)}
            </header>
            <ul className="grid grid-cols-4 gap-x-4 gap-y-4 mt-2">
              {subCategories.map((subCategory, idx) => (
                <li key={idx} className='g-white'>
                  <Link href={`/${encodeURIComponent(subCategory.title)}/${encodeURIComponent(subCategory.title)}`}>
                    <div className='relative aspect-[16/9] rounded overflow-hidden shadow'>
                      <Image src={`/samples2/${subCategory.image}`} alt={subCategory.title} fill  />
                    </div>
                    <span className='block text-sm text-slate-700 mt-2'>{subCategory.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}