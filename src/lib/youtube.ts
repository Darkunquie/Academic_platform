// Convert any YouTube URL (watch, youtu.be, shorts, embed) into a
// privacy-friendly embed URL. Returns null if it isn't a valid YouTube link.
export function youtubeEmbed(url?: string | null): string | null {
  if (!url) return null;
  let id = "";
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
      else id = u.searchParams.get("v") ?? "";
    }
  } catch {
    return null;
  }
  id = (id || "").split(/[/?&#]/)[0];
  if (!/^[a-zA-Z0-9_-]{6,15}$/.test(id)) return null;
  return `https://www.youtube-nocookie.com/embed/${id}`;
}
