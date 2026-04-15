"use client";

import { useState, useCallback, type FormEvent } from "react";
import { motion } from "framer-motion";
import { createContactSchema } from "@/lib/validations/contact";
import { fadeUp, slideLeft, slideRight, stagger, ease } from "@/lib/animations";
import type { ContactContent, SocialLinks } from "@/lib/config/landing-defaults";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "subject" | "message", string>>;

function Field({
  id, name, label, labelHint, type = "text", placeholder, error,
}: {
  id: string; name: string; label: string; labelHint?: string;
  type?: string; placeholder: string; error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-tertiary mb-2.5">
        {label}
        {labelHint && <span className="text-tertiary/30 ml-2 font-normal">{labelHint}</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={`w-full bg-transparent border px-4 py-3.5 text-[0.85rem] text-primary outline-none transition-all duration-400 focus:border-accent/40 focus:shadow-[0_0_0_1px_var(--accent-dim)] placeholder:text-tertiary/40 ${
          error ? "border-red-400/50" : "border-border-subtle"
        }`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1.5 text-[0.65rem] text-red-400/70">{error}</p>
      )}
    </div>
  );
}

export function ContactSection({ config, social }: { config: ContactContent; social: SocialLinks }) {
  const SOCIALS = [
    { label: "Instagram", href: social.instagram, handle: social.instagramHandle },
    { label: "YouTube", href: social.youtube, handle: social.youtubeHandle },
    { label: "TikTok", href: social.tiktok, handle: social.tiktokHandle },
  ];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const raw = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: (fd.get("phone") as string) || undefined,
      subject: fd.get("subject") as string,
      message: fd.get("message") as string,
    };

    const parsed = createContactSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) errors[field] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error de conexión");
      setStatus("error");
    }
  }, []);

  return (
    <section id="contact" className="section-py bg-surface relative overflow-hidden">
      <div
        aria-hidden
        className="absolute bottom-0 right-0 font-display text-[16vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none translate-y-[20%] translate-x-[5%]"
      >
        Contact
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="container-landing"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-12 md:mb-16 lg:mb-20">
          <span className="section-label mb-5 block">Contacto</span>
          <h2 className="section-heading">
            {config.heading}
            <br />
            <span className="text-accent">{config.headingAccent}</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6">
          {/* Info panel */}
          <motion.div variants={slideLeft} className="lg:col-span-4 space-y-8">
            <div>
              <h3 className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-accent mb-3.5">
                Colaboraciones
              </h3>
              <p className="text-secondary/60 leading-[1.85] text-[0.85rem]">
                {config.description}
              </p>
            </div>

            <div>
              <h3 className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-accent mb-3.5">
                Email directo
              </h3>
              <a
                href={`mailto:${config.email}`}
                className="text-primary/80 text-[0.85rem] hover:text-accent transition-colors duration-300"
              >
                {config.email}
              </a>
            </div>

            <div>
              <h3 className="text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-accent mb-4">
                Redes sociales
              </h3>
              <div>
                {SOCIALS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-3 border-b border-border-subtle group transition-colors duration-300 hover:border-accent/15"
                  >
                    <span className="text-[0.6rem] font-medium text-tertiary uppercase tracking-[0.2em] group-hover:text-secondary transition-colors duration-300">
                      {link.label}
                    </span>
                    <span className="text-[0.75rem] text-secondary/40 group-hover:text-accent transition-colors duration-300">
                      {link.handle}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div variants={slideRight} className="lg:col-span-7 lg:col-start-6">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease }}
                className="flex flex-col items-center justify-center min-h-[420px] text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 border border-accent/30 flex items-center justify-center mb-6"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-accent text-xl"
                  >
                    &#10003;
                  </motion.span>
                </motion.div>
                <h3 className="font-display text-2xl font-bold uppercase mb-2 tracking-wide">
                  Mensaje enviado
                </h3>
                <p className="text-secondary/50 text-sm mb-6">
                  Te responderé lo antes posible.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-[0.55rem] font-semibold text-accent hover:text-accent-hover transition-colors uppercase tracking-[0.25em] flex items-center gap-2"
                >
                  <span className="h-[1px] w-3 bg-accent" />
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field id="c-name" name="name" label="Nombre" placeholder="Tu nombre" error={fieldErrors.name} />
                  <Field id="c-email" name="email" label="Email" type="email" placeholder="tu@email.com" error={fieldErrors.email} />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field id="c-phone" name="phone" label="Teléfono" labelHint="Opcional" type="tel" placeholder="+52 555 123 4567" error={fieldErrors.phone} />
                  <Field id="c-subject" name="subject" label="Asunto" placeholder="Colaboración, coaching..." error={fieldErrors.subject} />
                </div>
                <div>
                  <label htmlFor="c-message" className="block text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-tertiary mb-2.5">
                    Mensaje
                  </label>
                  <textarea
                    id="c-message"
                    name="message"
                    rows={5}
                    className={`w-full bg-transparent border px-4 py-3.5 text-[0.85rem] text-primary outline-none transition-all duration-400 focus:border-accent/40 focus:shadow-[0_0_0_1px_var(--accent-dim)] resize-none placeholder:text-tertiary/40 ${
                      fieldErrors.message ? "border-red-400/50" : "border-border-subtle"
                    }`}
                    placeholder="Cuéntame sobre tu proyecto o propuesta..."
                  />
                  {fieldErrors.message && (
                    <p className="mt-1.5 text-[0.65rem] text-red-400/70">{fieldErrors.message}</p>
                  )}
                </div>

                {status === "error" && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.8rem] text-red-400/70 border border-red-400/15 bg-red-400/5 px-4 py-2.5"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="group relative inline-flex items-center gap-3 disabled:opacity-40"
                  >
                    <span className="relative border border-accent bg-accent text-void font-display font-semibold uppercase tracking-[0.2em] text-[0.65rem] px-10 py-4 transition-all duration-500 group-hover:bg-transparent group-hover:text-accent">
                      {status === "loading" ? "Enviando..." : config.ctaText}
                    </span>
                    <span className="text-accent text-base transition-transform duration-300 group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
