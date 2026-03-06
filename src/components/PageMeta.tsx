import { Helmet } from "react-helmet-async";

interface PageMetaProps {
  title: string;
  description?: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}

const SITE_NAME = "Aaro Systems";

const PageMeta = ({ title, description, ogImage, structuredData }: PageMetaProps) => {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
};

export default PageMeta;
