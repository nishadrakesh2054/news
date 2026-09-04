import Image, { type ImageProps } from "next/image";

type PortalImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string | null | undefined;
  alt: string;
  /** Fall back to plain <img> when URL host is not in remotePatterns. */
  allowUnoptimized?: boolean;
};

function isOptimizableSrc(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const host = new URL(src).hostname;
    return (
      host === "res.cloudinary.com" ||
      host.endsWith(".cloudinary.com") ||
      host === "echomanchnews.com" ||
      host === "en.echomanchnews.com" ||
      host === "echomanchs.com" ||
      host === "en.echomanchs.com" ||
      host.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

/**
 * next/image wrapper for portal LCP/card media.
 * Uses fill when width/height omitted and className implies absolute fill.
 */
export function PortalImage({
  src,
  alt,
  allowUnoptimized = true,
  className,
  sizes,
  priority,
  fill,
  width,
  height,
  ...rest
}: PortalImageProps) {
  if (!src) return null;

  const useFill = fill === true || (width == null && height == null);
  const canOptimize = isOptimizableSrc(src);

  if (!canOptimize && allowUnoptimized) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  if (useFill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, 70vw"}
        className={className}
        priority={priority}
        unoptimized={!canOptimize}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      unoptimized={!canOptimize}
      {...rest}
    />
  );
}
