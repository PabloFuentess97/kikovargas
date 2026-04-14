"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getConsent, setConsent, type ConsentStatus } from "@/lib/cookie-consent";

export function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus>("accepted"); // default to non-showing

  useEffect(() => {
    setStatus(getConsent());
  }, []);

  function handleAccept() {
    setConsent("accepted");
    setStatus("accepted");
  }

  function handleReject() {
    setConsent("rejected");
    setStatus("rejected");
  }

  const show = status === "pending";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[60] p-3 sm:p-4 md:p-5"
        >
          <div className="container-landing">
            <div className="bg-elevated/95 backdrop-blur-xl border border-border-subtle p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 shadow-[0_-4px_40px_rgba(0,0,0,0.5)]">
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[0.8rem] sm:text-[0.85rem] text-secondary/70 leading-relaxed">
                  Utilizamos cookies propias de analítica para mejorar tu experiencia en el sitio.
                  Puedes aceptar o rechazar su uso. Para más información, consulta nuestra{" "}
                  <a href="/cookies" className="text-accent hover:text-accent-hover transition-colors underline underline-offset-2">
                    Política de Cookies
                  </a>{" "}
                  y{" "}
                  <a href="/privacy" className="text-accent hover:text-accent-hover transition-colors underline underline-offset-2">
                    Política de Privacidad
                  </a>.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleReject}
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-secondary/60 hover:text-primary border border-border-subtle px-5 py-2.5 transition-all duration-300 hover:border-secondary/30"
                >
                  Rechazar
                </button>
                <button
                  onClick={handleAccept}
                  className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-void bg-accent hover:bg-accent-hover px-5 py-2.5 transition-colors duration-300"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
