type Props = {
  url: string
}

function isYoutubeShort(url: string) {
  return /https?:\/\/(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]+(?:\?[^\s]*)?/.test(url);
}

function formatUrl(url: string) {
  if (isYoutubeShort(url)) return url.replace(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/, 'youtube.com/embed/$1')
    return url;
}

export default function EmbedIframe({ url }: Props) {
  return (
    <iframe 
      width='100%'
      height='100%'
      src={formatUrl(url)}
      title="YouTube video player" 
      frameBorder={0} 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen={true}>
    </iframe>
  )
}