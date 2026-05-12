export const GOOGLE_ADS_EVENT_NAME = "manual_event_PAGE_VIEW";

export function trackGoogleAdsPageView() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", GOOGLE_ADS_EVENT_NAME, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
  });
}
