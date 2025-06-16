'use client';

import { usePathname } from 'next/navigation';

const TAG_ID = process.env.NEXT_PUBLIC_GOOGLE_META_TAG_ID;

export default function GTMHead() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (process.env.NODE_ENV !== 'production' || isAdmin) return null;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          <!-- Google Tag Manager -->
          <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${TAG_ID}');</script>
          <!-- End Google Tag Manager -->
        `,
      }}
    />
  );
}
