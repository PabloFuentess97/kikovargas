"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardHeader, CardContent, Button, FormLabel, Badge,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
} from "@/components/admin/ui";

interface Campaign {
  id: string;
  subject: string;
  template: string;
  status: string;
  sentAt: Date | null;
  sentCount: number;
  createdAt: Date;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishedAt: Date | null;
  cover: { url: string } | null;
}

export function NewsletterManager({
  initialCampaigns,
  posts,
  activeSubscribers,
}: {
  initialCampaigns: Campaign[];
  posts: Post[];
  activeSubscribers: number;
}) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [tab, setTab] = useState<"new_post" | "custom">("new_post");

  // New post campaign
  const [selectedPost, setSelectedPost] = useState("");
  const [postSubject, setPostSubject] = useState("");

  // Custom campaign
  const [customSubject, setCustomSubject] = useState("");
  const [customContent, setCustomContent] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function selectPost(postId: string) {
    setSelectedPost(postId);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setPostSubject(`Nuevo articulo: ${post.title}`);
    }
  }

  async function handleSendPostCampaign() {
    if (!selectedPost || !postSubject) return;
    setSending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: postSubject,
          content: `Nuevo post publicado`,
          template: "new_post",
          postId: selectedPost,
          send: true,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al enviar");

      setSuccessMsg(`Enviado a ${data.data.sent} suscriptores`);
      setCampaigns((prev) => [data.data.campaign, ...prev]);
      setSelectedPost("");
      setPostSubject("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  async function handleSendCustomCampaign() {
    if (!customSubject || !customContent) return;
    setSending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: customSubject,
          content: customContent,
          template: "custom",
          send: true,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Error al enviar");

      setSuccessMsg(`Enviado a ${data.data.sent} suscriptores`);
      setCampaigns((prev) => [data.data.campaign, ...prev]);
      setCustomSubject("");
      setCustomContent("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Composer */}
      <Card>
        <CardHeader title="Nueva campana" />
        <CardContent>
          {activeSubscribers === 0 && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3 text-sm text-warning mb-6">
              No hay suscriptores activos. La campana no se enviara a nadie.
            </div>
          )}

          {/* Template tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("new_post")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "new_post"
                  ? "bg-a-accent text-black"
                  : "bg-a-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              Nuevo post publicado
            </button>
            <button
              onClick={() => setTab("custom")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "custom"
                  ? "bg-a-accent text-black"
                  : "bg-a-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              Campana personalizada
            </button>
          </div>

          {/* New post template */}
          {tab === "new_post" && (
            <div className="space-y-4">
              <div>
                <FormLabel>Selecciona un post publicado</FormLabel>
                <select
                  value={selectedPost}
                  onChange={(e) => selectPost(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                >
                  <option value="">— Seleccionar post —</option>
                  {posts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("es-MX") : "sin fecha"})
                    </option>
                  ))}
                </select>
              </div>

              {selectedPost && (
                <>
                  {/* Post preview */}
                  {(() => {
                    const post = posts.find((p) => p.id === selectedPost);
                    if (!post) return null;
                    return (
                      <div className="rounded-lg border border-border p-4 flex gap-4 items-start">
                        {post.cover?.url && (
                          <img src={post.cover.url} alt="" className="w-20 h-14 rounded object-cover shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-semibold">{post.title}</p>
                          {post.excerpt && <p className="text-xs text-muted mt-1 line-clamp-2">{post.excerpt}</p>}
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <FormLabel>Asunto del email</FormLabel>
                    <input
                      type="text"
                      value={postSubject}
                      onChange={(e) => setPostSubject(e.target.value)}
                      className="w-full px-4 py-3 text-sm"
                      placeholder="Nuevo articulo: ..."
                    />
                  </div>

                  <p className="text-xs text-muted">
                    Se enviara con la plantilla de &quot;nuevo post&quot; que incluye imagen de portada, titulo, extracto y boton &quot;Leer articulo&quot;.
                  </p>

                  <Button
                    onClick={handleSendPostCampaign}
                    loading={sending}
                    disabled={!selectedPost || !postSubject}
                    size="lg"
                  >
                    Enviar a {activeSubscribers} suscriptores
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Custom template */}
          {tab === "custom" && (
            <div className="space-y-4">
              <div>
                <FormLabel>Asunto</FormLabel>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-4 py-3 text-sm"
                  placeholder="Asunto del email..."
                />
              </div>
              <div>
                <FormLabel>Contenido (HTML)</FormLabel>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 text-sm resize-y font-mono"
                  placeholder="<h2>Tu titulo aqui</h2><p>Escribe tu contenido...</p>"
                />
                <p className="mt-1 text-[0.6rem] text-muted/60">
                  Se envuelve automaticamente en la plantilla con el branding de la web. Usa HTML basico: h2, p, strong, a, ul/li.
                </p>
              </div>

              <Button
                onClick={handleSendCustomCampaign}
                loading={sending}
                disabled={!customSubject || !customContent}
                size="lg"
              >
                Enviar a {activeSubscribers} suscriptores
              </Button>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <div className="mt-4 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
              {successMsg}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign history */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
          Historial de campanas
        </h3>

        <Table>
          <TableHead>
            <TableHeader>Asunto</TableHeader>
            <TableHeader>Tipo</TableHeader>
            <TableHeader className="hidden sm:table-cell">Estado</TableHeader>
            <TableHeader className="hidden md:table-cell">Enviados</TableHeader>
            <TableHeader className="hidden md:table-cell">Fecha</TableHeader>
          </TableHead>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableEmpty
                colSpan={5}
                icon={
                  <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                }
                message="No hay campanas todavia"
              />
            ) : (
              campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="text-sm font-medium">{c.subject}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.template === "new_post" ? "accent" : "muted"}>
                      {c.template === "new_post" ? "Post" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={c.status === "SENT" ? "success" : "warning"}>
                      {c.status === "SENT" ? "Enviado" : "Borrador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted">{c.sentCount}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted">
                      {new Date(c.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
