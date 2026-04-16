"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { KB_CATEGORIES, type KBCategory, type KBArticle } from "./kb-content";

/* ─── Helpers ─────────────────────────────────────── */

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
  const words = text.split(" ").length;
  return Math.max(1, Math.ceil(words / 200));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ");
}

function extractHeadings(html: string): { id: string; text: string }[] {
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings: { id: string; text: string }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = stripHtml(match[1]);
    headings.push({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), text });
  }
  return headings;
}

/* ─── Copy-to-clipboard ──────────────────────────── */
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
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.65rem] font-medium transition-all text-muted hover:text-a-accent"
      title="Copiar al portapapeles"
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Copiado!
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
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-a-accent/25 text-a-accent rounded-sm px-0.5">{part}</mark>
    ) : (
      part
    )
  );
}

/* ─── Icons ───────────────────────────────────────── */
const SearchIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const BookIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const ClockIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronIcon = ({ className = "h-3 w-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

/* ─── Main Component ──────────────────────────────── */
export function KnowledgeBase() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Search across all categories
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const results: { category: KBCategory; article: KBArticle; matchType: "title" | "content" }[] = [];
    for (const cat of KB_CATEGORIES) {
      for (const art of cat.articles) {
        const titleMatch = art.title.toLowerCase().includes(q);
        const contentMatch = art.content.toLowerCase().includes(q);
        if (titleMatch || contentMatch) {
          results.push({ category: cat, article: art, matchType: titleMatch ? "title" : "content" });
        }
      }
    }
    // Title matches first
    results.sort((a, b) => (a.matchType === "title" ? -1 : 1) - (b.matchType === "title" ? -1 : 1));
    return results;
  }, [search]);

  const activeCategory = activeCategoryId ? KB_CATEGORIES.find((c) => c.id === activeCategoryId) : null;
  const activeArticle = activeCategory && activeArticleId
    ? activeCategory.articles.find((a) => a.id === activeArticleId) || null
    : null;

  // Get current article index for prev/next navigation
  const currentArticleIndex = activeCategory?.articles.findIndex((a) => a.id === activeArticleId) ?? -1;
  const prevArticle = activeCategory && currentArticleIndex > 0 ? activeCategory.articles[currentArticleIndex - 1] : null;
  const nextArticle = activeCategory && currentArticleIndex < (activeCategory.articles.length - 1) ? activeCategory.articles[currentArticleIndex + 1] : null;

  function navigateTo(catId: string, artId: string) {
    setActiveCategoryId(catId);
    setActiveArticleId(artId);
    setSearch("");
    setMobileSidebarOpen(false);
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectCategory(catId: string) {
    const cat = KB_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      setActiveCategoryId(catId);
      setActiveArticleId(cat.articles[0]?.id || null);
      setMobileSidebarOpen(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goHome() {
    setActiveCategoryId(null);
    setActiveArticleId(null);
    setSearch("");
    setMobileSidebarOpen(false);
  }

  // Keyboard shortcut: Ctrl/Cmd+K for search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (search) setSearch("");
        else setMobileSidebarOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [search]);

  // Inject heading IDs into article HTML for anchor links
  function processHtml(html: string): string {
    return html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, content) => {
      const text = stripHtml(content);
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h2${attrs} id="${id}">${content}</h2>`;
    });
  }

  // Parse and render content with code block copy buttons
  function renderContent(html: string) {
    const processed = processHtml(html);
    const codeBlockRegex = /<div class="kb-code">([\s\S]*?)<\/div>/g;
    const parts: { type: "html" | "code"; content: string }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(processed)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "html", content: processed.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", content: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < processed.length) {
      parts.push({ type: "html", content: processed.slice(lastIndex) });
    }

    if (parts.length === 0) {
      return <div className="kb-article-content" dangerouslySetInnerHTML={{ __html: processed }} />;
    }

    return (
      <div className="kb-article-content">
        {parts.map((part, i) =>
          part.type === "html" ? (
            <div key={i} dangerouslySetInnerHTML={{ __html: part.content }} />
          ) : (
            <div key={i} className="kb-code-wrapper">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.6rem] font-semibold text-muted/60 uppercase tracking-widest">Codigo / Configuracion</span>
                <CopyButton text={stripHtml(part.content)} />
              </div>
              <div className="kb-code" dangerouslySetInnerHTML={{ __html: part.content }} />
            </div>
          )
        )}
      </div>
    );
  }

  // Total article count
  const totalArticles = KB_CATEGORIES.reduce((sum, cat) => sum + cat.articles.length, 0);

  /* ─── Home view (no article selected) ───────────── */
  function renderHome() {
    return (
      <div className="p-6 md:p-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-a-accent/8 border border-a-accent/10 mb-4">
            <BookIcon className="h-7 w-7 text-a-accent" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Centro de ayuda</h1>
          <p className="text-sm text-muted max-w-md mx-auto">
            Todo lo que necesitas saber para sacarle el maximo partido a tu panel de administracion.
          </p>
          <p className="text-xs text-muted/50 mt-2">{KB_CATEGORIES.length} categorias &middot; {totalArticles} articulos</p>
        </div>

        {/* Search bar (home) */}
        <div className="max-w-lg mx-auto mb-10">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en la documentacion..."
              className="w-full rounded-xl border border-border bg-a-surface pl-11 pr-20 py-3 text-sm focus:border-a-accent focus:outline-none focus:ring-2 focus:ring-a-accent/10 transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.6rem] text-muted/50 bg-background border border-border font-mono">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Search results overlay on home */}
        {searchResults ? (
          <div className="max-w-2xl mx-auto">
            <p className="text-xs font-medium text-muted mb-3">
              {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} para &ldquo;{search}&rdquo;
            </p>
            {searchResults.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="h-10 w-10 text-muted/20 mx-auto mb-3" />
                <p className="text-sm text-muted">No se encontraron resultados</p>
                <p className="text-xs text-muted/50 mt-1">Intenta con otras palabras o busca por categoria</p>
              </div>
            ) : (
              <div className="space-y-1">
                {searchResults.map(({ category, article }) => (
                  <button
                    key={`${category.id}-${article.id}`}
                    onClick={() => navigateTo(category.id, article.id)}
                    className="w-full text-left px-4 py-3 rounded-lg border border-transparent hover:bg-card hover:border-border transition-all group flex items-start gap-3"
                  >
                    <span className="text-base mt-0.5 shrink-0">{category.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-a-accent transition-colors">
                        {highlightMatch(article.title, search)}
                      </p>
                      <p className="text-[0.7rem] text-muted mt-0.5">{category.label}</p>
                    </div>
                    <ChevronIcon className="h-4 w-4 text-muted/30 group-hover:text-a-accent ml-auto mt-1 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Category grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {KB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className="kb-category-card text-left p-5 rounded-xl border border-border bg-card hover:border-a-accent/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[0.6rem] font-medium text-muted/50 bg-background px-2 py-0.5 rounded-full">
                    {cat.articles.length} {cat.articles.length === 1 ? "articulo" : "articulos"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-a-accent transition-colors mb-1">
                  {cat.label}
                </h3>
                <p className="text-xs text-muted leading-relaxed">{cat.description}</p>
                {/* First 2 article titles as preview */}
                <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                  {cat.articles.slice(0, 2).map((art) => (
                    <p key={art.id} className="text-[0.65rem] text-muted/60 truncate flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-muted/30 shrink-0" />
                      {art.title}
                    </p>
                  ))}
                  {cat.articles.length > 2 && (
                    <p className="text-[0.65rem] text-muted/40">+{cat.articles.length - 2} mas</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─── Article view ──────────────────────────────── */
  function renderArticle() {
    if (!activeArticle || !activeCategory) return null;

    const readingTime = estimateReadingTime(activeArticle.content);
    const headings = extractHeadings(activeArticle.content);

    return (
      <div className="p-6 md:p-8 lg:p-10 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs mb-6 flex-wrap">
          <button onClick={goHome} className="text-muted hover:text-a-accent transition-colors">
            Inicio
          </button>
          <ChevronIcon className="h-2.5 w-2.5 text-muted/40" />
          <button
            onClick={() => selectCategory(activeCategory.id)}
            className="text-muted hover:text-a-accent transition-colors flex items-center gap-1"
          >
            <span className="text-xs">{activeCategory.icon}</span>
            {activeCategory.label}
          </button>
          <ChevronIcon className="h-2.5 w-2.5 text-muted/40" />
          <span className="text-foreground/70 font-medium">{activeArticle.title}</span>
        </nav>

        {/* Title + meta */}
        <h1 className="text-xl md:text-2xl font-bold text-foreground leading-snug mb-3">
          {activeArticle.title}
        </h1>
        <div className="flex items-center gap-3 mb-8 text-xs text-muted/60">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {readingTime} min de lectura
          </span>
          <span className="h-3 w-px bg-border" />
          <span>{activeCategory.label}</span>
        </div>

        {/* Table of Contents (for articles with 3+ headings) */}
        {headings.length >= 3 && (
          <div className="kb-toc mb-8 rounded-lg border border-border bg-a-surface/50 p-4">
            <p className="text-[0.65rem] font-semibold text-muted uppercase tracking-widest mb-2.5">
              En esta pagina
            </p>
            <nav className="space-y-1">
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = contentRef.current?.querySelector(`#${h.id}`);
                    el?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="block text-xs text-muted hover:text-a-accent transition-colors py-0.5 pl-3 border-l-2 border-transparent hover:border-a-accent/40"
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Content */}
        {renderContent(activeArticle.content)}

        {/* Prev/Next navigation */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-3">
            {prevArticle ? (
              <button
                onClick={() => navigateTo(activeCategory.id, prevArticle.id)}
                className="text-left p-4 rounded-lg border border-border hover:border-a-accent/20 transition-all group"
              >
                <p className="text-[0.6rem] font-medium text-muted/50 uppercase tracking-wider mb-1">Anterior</p>
                <p className="text-xs font-medium text-foreground group-hover:text-a-accent transition-colors">
                  {prevArticle.title}
                </p>
              </button>
            ) : <div />}
            {nextArticle ? (
              <button
                onClick={() => navigateTo(activeCategory.id, nextArticle.id)}
                className="text-right p-4 rounded-lg border border-border hover:border-a-accent/20 transition-all group"
              >
                <p className="text-[0.6rem] font-medium text-muted/50 uppercase tracking-wider mb-1">Siguiente</p>
                <p className="text-xs font-medium text-foreground group-hover:text-a-accent transition-colors">
                  {nextArticle.title}
                </p>
              </button>
            ) : <div />}
          </div>
        </div>

        {/* Helpful? */}
        <div className="mt-8 text-center">
          <p className="text-[0.65rem] text-muted/40">
            Ultima actualizacion: Abril 2026
          </p>
        </div>
      </div>
    );
  }

  /* ─── Render ────────────────────────────────────── */
  const isHome = !activeCategoryId;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={goHome}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-a-accent/10 hover:bg-a-accent/15 transition-colors"
          >
            <BookIcon className="h-5 w-5 text-a-accent" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">
              {isHome ? "Guia de uso" : (
                <button onClick={goHome} className="hover:text-a-accent transition-colors">
                  Guia de uso
                </button>
              )}
            </h1>
            <p className="text-xs text-muted">Documentacion completa del panel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop search shortcut hint */}
          {!isHome && (
            <div className="hidden md:flex items-center">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted/40 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-48 rounded-lg border border-border bg-a-surface pl-9 pr-14 py-1.5 text-xs focus:border-a-accent focus:outline-none focus:w-72 transition-all"
                />
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center px-1 py-0.5 rounded text-[0.55rem] text-muted/40 bg-background border border-border/50 font-mono">
                  CtrlK
                </kbd>
              </div>
            </div>
          )}

          {/* Mobile sidebar toggle */}
          {!isHome && (
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted hover:text-foreground transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              Indice
            </button>
          )}
        </div>
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

        {/* ── Sidebar (only when article is active) ── */}
        {!isHome && (
          <aside
            className={`
              ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              fixed md:relative z-40 md:z-auto
              top-0 md:top-auto left-0 md:left-auto
              h-full md:h-auto
              w-[280px] md:w-[240px] shrink-0
              bg-a-surface md:bg-card border-r md:border border-border md:rounded-xl
              flex flex-col
              transform transition-transform duration-300 md:transform-none
              overflow-hidden
            `}
          >
            {/* Mobile close */}
            <div className="md:hidden flex items-center justify-between p-3 border-b border-border">
              <span className="text-xs font-semibold">Navegacion</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-muted hover:text-foreground">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Category list */}
            <div className="flex-1 overflow-y-auto p-2.5">
              {/* Home link */}
              <button
                onClick={goHome}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-foreground hover:bg-card-hover transition-all flex items-center gap-2 mb-2"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Todas las categorias
              </button>

              <div className="h-px bg-border mx-2 mb-2" />

              {KB_CATEGORIES.map((cat) => {
                const isActiveCat = activeCategoryId === cat.id;
                return (
                  <div key={cat.id} className="mb-1">
                    <button
                      onClick={() => selectCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        isActiveCat
                          ? "bg-a-accent/8 text-a-accent"
                          : "text-muted hover:text-foreground hover:bg-card-hover"
                      }`}
                    >
                      <span className="text-sm shrink-0">{cat.icon}</span>
                      <span className="text-xs font-medium truncate">{cat.label}</span>
                    </button>

                    {/* Expanded articles for active category */}
                    {isActiveCat && (
                      <div className="ml-5 mt-0.5 mb-1 pl-3 border-l border-border/50 space-y-0.5">
                        {cat.articles.map((art) => (
                          <button
                            key={art.id}
                            onClick={() => navigateTo(cat.id, art.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-[0.7rem] transition-all ${
                              activeArticleId === art.id
                                ? "text-a-accent font-medium bg-a-accent/5"
                                : "text-muted/70 hover:text-foreground"
                            }`}
                          >
                            {art.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ── Content area ── */}
        <div className={`flex-1 flex flex-col min-w-0 ${isHome ? "" : "border border-border rounded-xl bg-card"} overflow-hidden`}>
          {/* Search results dropdown when typing in header search */}
          {!isHome && searchResults && (
            <div className="hidden md:block border-b border-border bg-card-hover/50 max-h-64 overflow-y-auto">
              <div className="p-3">
                <p className="text-[0.65rem] font-medium text-muted mb-2 px-2">
                  {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                </p>
                {searchResults.length === 0 ? (
                  <p className="text-xs text-muted text-center py-4">Sin resultados para &ldquo;{search}&rdquo;</p>
                ) : (
                  <div className="space-y-0.5">
                    {searchResults.slice(0, 8).map(({ category, article }) => (
                      <button
                        key={`${category.id}-${article.id}`}
                        onClick={() => { navigateTo(category.id, article.id); setSearch(""); }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-card-hover transition-colors group flex items-center gap-2.5"
                      >
                        <span className="text-sm">{category.icon}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground group-hover:text-a-accent truncate transition-colors">
                            {highlightMatch(article.title, search)}
                          </p>
                          <p className="text-[0.6rem] text-muted/50">{category.label}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto">
            {isHome ? renderHome() : renderArticle()}
          </div>
        </div>
      </div>
    </div>
  );
}
