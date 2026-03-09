export const SITE_NAME = "Swap";
export const SITE_TITLE = "Swap | Swipe. Trade. Meet.";
export const SITE_DESCRIPTION =
  "Swap is a Tinder-style local marketplace with swipe discovery, chat, and live meetup location sharing.";

export function getSiteUrl() {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export const OG_IMAGE_PATH = "/OG-Image.png";
