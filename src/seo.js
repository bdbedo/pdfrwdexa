export function setPageMeta({ title, description, canonicalPath }) {
  document.title = title;

  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) {
    descriptionTag.setAttribute('content', description);
  }

  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (ogTitleTag) {
    ogTitleTag.setAttribute('content', title);
  }

  const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  if (ogDescriptionTag) {
    ogDescriptionTag.setAttribute('content', description);
  }

  const canonicalTag = document.querySelector('link[rel="canonical"]');
  const canonicalUrl = `https://pdfrwdexa.example.com${canonicalPath}`;
  if (canonicalTag) {
    canonicalTag.setAttribute('href', canonicalUrl);
  }
}
