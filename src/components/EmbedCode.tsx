'use client';

import { useEffect, useRef } from 'react';

type Props = {
  code: string 
}

export default function EmbedCode({ code }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Set HTML
    containerRef.current.innerHTML = code;

    // Extract any script tags manually and re-execute
    const scripts = containerRef.current.querySelectorAll('script');

    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      if (oldScript.src) {
        newScript.src = oldScript.src;
        newScript.async = true;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.body.appendChild(newScript);
    });

    return () => {
      // Clean up dynamic scripts if needed
    };
  }, [code]);

  return <div ref={containerRef} />;
}
