import type { VideoData } from "../types";

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Direct embed URL
  if (url.includes("embed") || url.includes("player")) return url;

  return null;
}

export function VideoBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as VideoData;
  const embedUrl = getEmbedUrl(d.url || "");

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {d.heading && (
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">{d.heading}</h2>
        )}
        {d.description && (
          <p className="text-[#999] text-base mb-8 text-center max-w-2xl mx-auto">{d.description}</p>
        )}

        {embedUrl ? (
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#1a1a1a]" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              title={d.heading || "Video"}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
            <div className="text-center">
              <svg className="h-12 w-12 text-[#333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
              <p className="text-[#444] text-sm">Video no configurado</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
