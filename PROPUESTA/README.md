# Propuesta KikoVargas.fit

Dos formatos listos para entregar al cliente:

## Archivos

- **`propuesta-kikovargas-fit.html`** — Versión premium con diseño fitness dark/gold. **Usa este para generar el PDF.**
- **`propuesta-kikovargas-fit.md`** — Versión markdown (editable, para revisar contenido)

## Cómo convertir a PDF

### Opción A (recomendada) — Navegador Chrome/Edge

1. Abre `propuesta-kikovargas-fit.html` en Chrome o Edge
2. Pulsa `Ctrl + P` (o `Cmd + P` en Mac)
3. En "Destino" elige **"Guardar como PDF"**
4. Configuración:
   - Tamaño: **A4**
   - Márgenes: **Ninguno**
   - Escala: **Predeterminada** (100%)
   - Opciones → ✅ **Gráficos en segundo plano** (IMPORTANTE — activa los colores del fondo oscuro)
5. Guardar

El resultado son 12 páginas profesionales con el branding premium fitness.

### Opción B — CLI (si tienes Chrome instalado)

```bash
# Windows
chrome.exe --headless --disable-gpu --print-to-pdf="propuesta.pdf" --no-margins --print-to-pdf-no-header "file:///C:/Users/pablo/Desktop/kikovargass/PROPUESTA/propuesta-kikovargas-fit.html"

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --disable-gpu --print-to-pdf=propuesta.pdf --no-margins "file:///ruta/al/html"
```

### Opción C — wkhtmltopdf

```bash
wkhtmltopdf --page-size A4 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 --enable-local-file-access propuesta-kikovargas-fit.html propuesta.pdf
```

## Estructura del documento

12 páginas:

1. **Portada** — Título, subtítulo, tagline
2. **Introducción** — Qué es la plataforma
3. **El Problema** — Riesgos de depender solo de redes
4. **La Solución** — Tres pilares
5. **Funcionalidades (1/2)** — 5 primeras
6. **Funcionalidades (2/2)** — 5 últimas + resumen
7. **Ventajas** — Marca personal con dominio propio
8. **Beneficios** — Impacto en facturación
9. **Comparación** — Redes vs. plataforma propia
10. **Desafíos** — Honestidad y gestión
11. **Potencial a futuro** — Cómo escalar
12. **Conclusión** — Cierre + próximo paso

## Estilo visual

- Paleta: Negro profundo (`#030303`) + dorado (`#c9a84c`)
- Tipografía: Oswald (titulares uppercase) + Inter (cuerpo)
- Branding fitness premium, editorial
- Numeración de secciones estilo revista
- Numeración de páginas en pie
- Callouts dorados para puntos clave
- Tabla comparativa con código de color
- Pull quotes tipo cita destacada
- Portada con patrón diagonal sutil y línea dorada superior

## Personalización

Para ajustar contenido, edita `propuesta-kikovargas-fit.html` directamente.
Para ajustar el diseño, los estilos están en el `<style>` al inicio del HTML.

Los colores de marca están en variables CSS al principio:
```css
--accent: #c9a84c;
--accent-bright: #dfc06a;
--bg-void: #030303;
```

Cambiarlos actualiza todo el documento.
