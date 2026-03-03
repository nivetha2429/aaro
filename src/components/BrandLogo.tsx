import { useState } from "react";

interface BrandLogoProps {
  src?: string;
  name: string;
  imgClassName?: string;
  fallbackClassName?: string;
}

const BrandLogo = ({ src, name, imgClassName, fallbackClassName }: BrandLogoProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={fallbackClassName || "text-xl font-black text-primary/30 tracking-tighter leading-none"}>
        {name.charAt(0)}
      </span>
    );
  }

  const isSvg = src.toLowerCase().endsWith('.svg');

  return (
    <img
      src={src}
      alt={name}
      className={imgClassName}
      onError={() => setFailed(true)}
      style={isSvg ? { imageRendering: 'auto' } : undefined}
      loading="lazy"
      decoding="async"
    />
  );
};

export default BrandLogo;
