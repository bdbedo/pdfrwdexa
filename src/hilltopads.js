const HILLTOPADS_SCRIPT_ID = 'hilltopads-popunder-script';
const HILLTOPADS_TRIGGERED_KEY = 'pdfrwdexa-hilltopads-triggered';
const HILLTOPADS_LOADED_KEY = 'pdfrwdexa-hilltopads-loaded';

let scriptLoadPromise = null;

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function markSessionFlag(key) {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Ignore storage errors to preserve a smooth UX.
  }
}

function hasSessionFlag(key) {
  if (!isBrowser()) return false;
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function loadScriptOnce() {
  if (!isBrowser()) {
    return Promise.resolve(false);
  }

  if (hasSessionFlag(HILLTOPADS_LOADED_KEY)) {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve) => {
    const existingScript = document.getElementById(HILLTOPADS_SCRIPT_ID);
    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        markSessionFlag(HILLTOPADS_LOADED_KEY);
        resolve(true);
        return;
      }

      existingScript.addEventListener('load', () => {
        existingScript.dataset.loaded = 'true';
        markSessionFlag(HILLTOPADS_LOADED_KEY);
        resolve(true);
      }, { once: true });
      existingScript.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = HILLTOPADS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = 'https://cdn.hilltopads.com/popup.js';
    script.onload = () => {
      script.dataset.loaded = 'true';
      markSessionFlag(HILLTOPADS_LOADED_KEY);
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function triggerHilltopAdsPopunder() {
  if (!isBrowser()) {
    return false;
  }

  if (hasSessionFlag(HILLTOPADS_TRIGGERED_KEY)) {
    return false;
  }

  const loaded = await loadScriptOnce();
  if (!loaded) {
    return false;
  }

  markSessionFlag(HILLTOPADS_TRIGGERED_KEY);

  try {
    if (window.open) {
      const popup = window.open('', '_blank', 'noopener,noreferrer');
      if (popup) {
        popup.opener = null;
      }
    }
  } catch {
    // Keep the download flow intact even if the ad trigger fails.
  }

  return true;
}
