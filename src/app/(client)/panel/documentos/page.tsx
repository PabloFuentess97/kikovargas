import { requireClient } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fileIcon(mime: string): string {
  if (mime.startsWith("image/")) return "🖼️";
  if (mime === "application/pdf") return "📄";
  if (mime.includes("word") || mime.includes("document")) return "📝";
  if (mime.includes("sheet") || mime.includes("excel")) return "📊";
  return "📎";
}

export default async function ClientDocumentsPage() {
  const session = await requireClient();

  const docs = await prisma.clientDocument.findMany({
    where: { clientId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
          <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Sin documentos</h3>
        <p className="text-sm text-muted max-w-xs">Aqui apareceran los archivos que Kiko comparta contigo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <a
          key={doc.id}
          href={`/api/panel/documents/${doc.id}/download`}
          target="_blank"
          rel="noopener"
          className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border active:bg-card-hover active:scale-[0.99] transition-all"
        >
          <span className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-background text-xl">
            {fileIcon(doc.fileMime)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
            {doc.description && (
              <p className="text-[0.75rem] text-muted line-clamp-2 mt-0.5">{doc.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 text-[0.65rem] text-muted">
              <span>{humanSize(doc.fileSize)}</span>
              <span>·</span>
              <span>{new Date(doc.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
              {doc.uploadedBy === "COACH" && (
                <>
                  <span>·</span>
                  <span className="text-a-accent">De Kiko</span>
                </>
              )}
            </div>
          </div>
          <svg className="h-4 w-4 text-muted mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </a>
      ))}
    </div>
  );
}
