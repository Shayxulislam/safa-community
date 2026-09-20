import React, { useEffect } from 'react';

const SITE_URL = 'https://safa-community.vercel.app';
const DEFAULT_DESCRIPTION = 'SAFA is a youth-led community-support initiative in Uzbekistan connecting people who want to help with communities and families in need.';

interface SeoHeadProps {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  schema?: Record<string, unknown>;
  noindex?: boolean;
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = '/safa-logo.svg',
  type = 'website',
  schema,
  noindex = false
}) => {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;
    const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:alt', title);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const existingSchema = document.head.querySelector<HTMLScriptElement>('script[data-safa-schema]');
    if (existingSchema) existingSchema.remove();
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.dataset.safaSchema = 'true';
    schemaScript.textContent = JSON.stringify(schema || {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SAFA',
      url: `${SITE_URL}/`,
      description,
      publisher: { '@type': 'Organization', name: 'SAFA', url: `${SITE_URL}/` }
    });
    document.head.appendChild(schemaScript);
  }, [description, image, noindex, path, schema, title, type]);

  return null;
};

export { SITE_URL };