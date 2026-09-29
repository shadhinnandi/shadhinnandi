// Responsive, lazily loaded image built from a media descriptor (lib/media.js).
export default function Img({ media, sizes = '100vw', eager = false, className = '', fit }) {
  if (!media) return null;
  const style = {};
  if (media.position) style.objectPosition = media.position;
  const objectFit = fit || media.fit;
  if (objectFit) style.objectFit = objectFit;
  return (
    <img
      className={className || undefined}
      src={media.src}
      srcSet={media.srcSet}
      sizes={sizes}
      width={media.width}
      height={media.height}
      alt={media.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      style={style}
    />
  );
}
