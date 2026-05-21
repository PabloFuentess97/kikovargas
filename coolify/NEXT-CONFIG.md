# Verificación de `next.config.ts`

El Dockerfile asume que `next.config.ts` tiene:

```ts
const nextConfig = {
  output: "standalone",
  // ... resto de tu config
};

export default nextConfig;
```

✅ Confirmado en tu repo actual (ya está `output: "standalone"`).

---

## Opcional pero recomendado para Coolify

Si usas un dominio detrás de Traefik (Coolify), añade:

```ts
const nextConfig = {
  output: "standalone",
  // Permite que Next.js confíe en los headers de Traefik
  // (X-Forwarded-Proto, X-Forwarded-For)
  // Esto es importante para que cookies con secure=true funcionen
  // y para que getServerSideProps reciba la IP real del cliente.
  experimental: {
    // Si tienes problemas con uploads >1MB:
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Si tu app sirve imágenes desde dominios externos
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "kikovargas.fit" },
    ],
  },
};
```

---

## Importante para `private-uploads/`

Tu Dockerfile crea `/app/private-uploads` dentro del contenedor.
Para que las imágenes subidas persistan entre deploys, Coolify debe
montar este directorio como **persistent volume** (ver guía PDF).
