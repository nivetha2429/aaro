/**
 * Build an optimized Cloudinary URL with auto-format, auto-quality, and width.
 * If the URL is not from Cloudinary, returns it unchanged.
 */
export function optimizedImageUrl(
  url: string | undefined,
  width: number = 400
): string {
  if (!url) return "";
  // Only transform Cloudinary URLs
  if (!url.includes("res.cloudinary.com")) return url;
  // Already has transforms — skip
  if (url.includes("/f_auto") || url.includes("/q_auto")) return url;
  // Insert transforms before /upload/
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,w_${width}/`
  );
}

export function thumbnailUrl(url: string | undefined): string {
  return optimizedImageUrl(url, 400);
}

export function detailImageUrl(url: string | undefined): string {
  return optimizedImageUrl(url, 800);
}

export function heroImageUrl(url: string | undefined): string {
  return optimizedImageUrl(url, 1200);
}
