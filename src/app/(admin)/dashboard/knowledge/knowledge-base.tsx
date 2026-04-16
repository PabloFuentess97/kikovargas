"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { KB_CATEGORIES, type KBCategory, type KBArticle } from "./kb-content";

/* ─── Copy-to-clipboard helper ────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[0.7rem] font-medium transition-all bg-a-surface border border-border hover:border-a-accent/30 text-muted hover:text-a-accent"
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

/* ─── Search highlighting ─────────────────────────── */
function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-a-accent/20 text-a-accent rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/* ─── Main Component ──────────────────────────────── */
export function KnowledgeBase() {
  const [activeCategoryId, setActiveCategoryId] = useState(KB_CATEGORIES[0].id);
  const [activeArticleId, setActiveArticleId] = useState(KB_CATEGORIES[0].articles[0]?.id || "");
  const [search, setSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter articles across all categories by search
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const results: { category: KBCategory; article: KBArticle }[] = [];
    for (const cat of KB_CATEGORIES) {
      for (const art of cat.articles) {
        if (
          art.title.toLowerCase().includes(q) ||
          art.content.toLowerCase().includes(q)
        ) {
          results.push({ category: cat, article: art });
        }
      }
    }
    return results;
  }, [search]);

  const activeCategory = KB_CATEGORIES.find((c) => c.id === activeCategoryId) || KB_CATEGORIES[0];
  const activeArticle = activeCategory.articles.find((a) => a.id === activeArticleId) || activeCategory.articles[0];

  function navigateTo(catId: string, artId: string) {
    setActiveCategoryId(catId);
    setActiveArticleId(artId);
    setSearch("");
    setMobileSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Reset article when changing category
  function selectCategory(catId: string) {
    const cat = KB_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setActiveCategoryId(catId);
      setActiveArticleId(cat.articles[0]?.id || "");
      setMobileSidebarOpen(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Close mobile sidebar on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Parse code blocks from content and add copy buttons
  function renderContent(html: string) {
    // Find all code-like patterns (text between backticks or in kb-code blocks)
    const codeBlockRegex = /<div class="kb-code">([\s\S]*?)<\/div>/g;
    const parts: { type: "html" | "code"; content: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(html)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "html", content: html.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < html.length) {
      parts.push({ type: "html", content: html.slice(lastIndex) });
    }

    if (parts.length === 0) {
      return <div className="kb-article-content" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    return (
      <div className="kb-article-content">
        {parts.map((part, i) =>
          part.type === "html" ? (
            <div key={i} dangerouslySetInnerHTML={{ __html: part.content }} />
          ) : (
            <div key={i} className="kb-code-wrapper">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.65rem] font-medium text-muted uppercase tracking-wider">Codigo / Configuracion</span>
                <CopyButton text={part.content.replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")} />
              </div>
              <div className="kb-code" dangerouslySetInnerHTML={{ __html: part.content }} />
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-a-accent/10">
            <svg className="h-5 w-5 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold">Base de Conocimiento</h1>
            <p className="text-xs text-muted">Documentacion y guias de uso del panel</p>
          </div>
        </div>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          Categorias
        </button>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 gap-4">
        {/* ── Mobile overlay ── */}
        {mobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            fixed md:relative z-40 md:z-auto
            top-0 md:top-auto left-0 md:left-auto
            h-full md:h-auto
            w-[280px] md:w-[260px] shrink-0
            bg-a-surface md:bg-card border-r md:border border-border md:rounded-xl
            flex flex-col
            transform transition-transform duration-300 md:transform-none
            overflow-hidden
          `}
        >
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en la documentacion..."
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs focus:border-a-accent focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Search results */}
          {searchResults ? (
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-[0.65rem] font-medium text-muted uppercase tracking-wider mb-2 px-2">
                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
              </p>
              {searchResults.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <svg className="h-8 w-8 text-muted/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <p className="text-xs text-muted">No se encontraron resultados</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map(({ category, article }) => (
                    <button
                      key={`${category.id}-${article.id}`}
                      onClick={() => navigateTo(category.id, article.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-card-hover transition-colors group"
                    >
                      <p className="text-xs font-medium text-foreground group-hover:text-a-accent transition-colors">
                        {highlightMatch(article.title, search)}
                      </p>
                      <p className="text-[0.65rem] text-muted mt-0.5">
                        {category.icon} {category.label}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Category list */
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {KB_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group ${
                      activeCategoryId === cat.id
                        ? "bg-a-accent/8 border border-a-accent/15"
                        : "hover:bg-card-hover border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{cat.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-medium transition-colors ${
                            activeCategoryId === cat.id ? "text-a-accent" : "text-foreground group-hover:text-a-accent"
                          }`}
                        >
                          {cat.label}
                        </p>
                        <p className="text-[0.6rem] text-muted truncate">{cat.description}</p>
                      </div>
                      <span className="text-[0.6rem] text-muted bg-background px-1.5 py-0.5 rounded shrink-0">
                        {cat.articles.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Content area ── */}
        <div className="flex-1 flex flex-col min-w-0 border border-border rounded-xl bg-card overflow-hidden">
          {/* Article tabs */}
          <div className="border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
              {activeCategory.articles.map((art) => (
                <button
                  key={art.id}
                  onClick={() => {
                    setActiveArticleId(art.id);
                    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeArticleId === art.id
                      ? "bg-a-accent/10 text-a-accent"
                      : "text-muted hover:text-foreground hover:bg-card-hover"
                  }`}
                >
                  {art.title}
                </button>
              ))}
            </div>
          </div>

          {/* Article content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-6 md:p-8">
            {activeArticle ? (
              <div>
                {/* Category breadcrumb */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm">{activeCategory.icon}</span>
                  <span className="text-[0.65rem] font-medium text-muted uppercase tracking-wider">
                    {activeCategory.label}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl md:text-2xl font-bold text-foreground mb-6 leading-tight">
                  {activeArticle.title}
                </h1>

                {/* Content */}
                {renderContent(activeArticle.content)}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted">
                <p className="text-sm">Selecciona un articulo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
