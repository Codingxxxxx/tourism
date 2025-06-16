'use client';

import { usePathname } from 'next/navigation';

const TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_META_TAG_ID;

export default function GTMBody() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (process.env.NODE_ENV !== 'production' || isAdmin) return null;

  return (
    <noscript>
      <iframe 
        src={`https://www.googletagmanager.com/ns.html?id=${TAG_ID}`}
        height="0" width="0" 
        style={{ display: 'none', visibility: 'hidden' }}
      >
      </iframe>
    </noscript>
  )
}
