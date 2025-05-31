type Props = {
  url: string
}

export default function EmbedIframe({ url }: Props) {
  console.log(url);
  return (
    <iframe 
      width='100%'
      height='100%'
      src={url}
      title="YouTube video player" 
      frameBorder={0} 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen={true}>
    </iframe>
  )
}