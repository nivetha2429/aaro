import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  robots?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  canonicalPath?: string;
}

const SITE_NAME = "Aaro Groups";
const SITE_URL = "https://aarogroups.com";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

const PageMeta = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  robots = "index, follow",
  structuredData,
  canonicalPath,
}: PageMetaProps) => {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : ogUrl;
  const image = ogImage || DEFAULT_IMAGE;
  const url = ogUrl || canonical || SITE_URL;

  const schemaArray = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {schemaArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default PageMeta;
