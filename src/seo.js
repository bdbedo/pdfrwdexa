export function setPageMeta({ title, description, canonicalPath, ogImage = '/og-image.svg' }) {
  const siteUrl = 'https://pdfrwdexa.vercel.app';
  const canonicalUrl = new URL(canonicalPath, siteUrl).toString();

  const ensureMeta = (selector, attributes) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      Object.entries(attributes).forEach(([key, value]) => {
        if (value) element.setAttribute(key, value);
      });
      document.head.appendChild(element);
    }
    return element;
  };

  document.title = title;

  const descriptionTag = ensureMeta('meta[name="description"]', { name: 'description' });
  descriptionTag.setAttribute('content', description);

  const robotsTag = ensureMeta('meta[name="robots"]', { name: 'robots' });
  robotsTag.setAttribute('content', 'index,follow');

  const ogTitleTag = ensureMeta('meta[property="og:title"]', { property: 'og:title' });
  ogTitleTag.setAttribute('content', title);

  const ogDescriptionTag = ensureMeta('meta[property="og:description"]', { property: 'og:description' });
  ogDescriptionTag.setAttribute('content', description);

  const ogUrlTag = ensureMeta('meta[property="og:url"]', { property: 'og:url' });
  ogUrlTag.setAttribute('content', canonicalUrl);

  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const ogImageTag = ensureMeta('meta[property="og:image"]', { property: 'og:image' });
  ogImageTag.setAttribute('content', ogImageUrl);

  const twitterImageTag = ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image' });
  twitterImageTag.setAttribute('content', ogImageUrl);

  const canonicalTag = document.querySelector('link[rel="canonical"]') || document.createElement('link');
  canonicalTag.setAttribute('rel', 'canonical');
  canonicalTag.setAttribute('href', canonicalUrl);
  if (!canonicalTag.parentNode) {
    document.head.appendChild(canonicalTag);
  }
}
