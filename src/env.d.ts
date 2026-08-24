/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_ID?: string;
}

// Chargé dynamiquement par src/components/Analytics.astro après consentement.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }

  interface WindowEventMap {
    'cookie-consent-changed': CustomEvent<'granted' | 'denied'>;
  }
}
