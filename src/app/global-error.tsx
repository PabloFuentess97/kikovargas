"use client";

/**
 * Global error boundary — catches errors in the root layout itself.
 * Must render its own <html>/<body> since the root layout may have crashed.
 * Cannot use Framer Motion here (root layout fonts may not be loaded),
 * so we use CSS animations for a lightweight but branded fallback.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030303",
          color: "#ededed",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Vignette */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            boxShadow: "inset 0 0 250px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "2rem",
            maxWidth: "480px",
            animation: "fadeIn 0.8s ease-out both",
          }}
        >
          {/* Accent line */}
          <div
            style={{
              width: "3rem",
              height: "1px",
              background: "#c9a84c",
              margin: "0 auto 2.5rem",
              animation: "expandLine 1s cubic-bezier(0.4,0,0,1) both",
            }}
          />

          {/* Error label */}
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.6)",
              marginBottom: "1.5rem",
            }}
          >
            Error crítico
          </p>

          {/* Heading */}
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              lineHeight: 0.92,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            Algo ha <span style={{ color: "#c9a84c" }}>fallado</span>
          </h1>

          {/* Body */}
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(122,122,122,0.7)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
            }}
          >
            Ha ocurrido un error grave en la aplicación.
            Puedes intentar recargar o volver al inicio.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                border: "1px solid rgba(201,168,76,0.3)",
                background: "transparent",
                color: "#c9a84c",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.6rem",
                padding: "0.875rem 2rem",
                cursor: "pointer",
                transition: "all 0.4s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#c9a84c";
                e.currentTarget.style.color = "#030303";
                e.currentTarget.style.borderColor = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#c9a84c";
                e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
              }}
            >
              Reintentar
            </button>

            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                fontSize: "0.6rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "rgba(122,122,122,0.5)",
                textDecoration: "none",
                padding: "0.875rem 1rem",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a84c"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(122,122,122,0.5)"; }}
            >
              &larr;&ensp;Volver al inicio
            </a>
          </div>

          {/* Quote */}
          <p
            style={{
              marginTop: "4rem",
              fontSize: "0.6rem",
              textTransform: "uppercase",
              letterSpacing: "0.3em",
              color: "rgba(61,61,61,0.6)",
              fontStyle: "italic",
              animation: "fadeIn 1.5s ease-out 1.5s both",
            }}
          >
            &ldquo;La fuerza no viene del cuerpo. Viene de la voluntad.&rdquo;
          </p>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes expandLine {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}</style>
      </body>
    </html>
  );
}
