# CTA Texts and Microcopy

Complete reference of every call-to-action, button label, status indicator, and microcopy string used throughout the application.

## Landing Page CTAs

| Location | Text | Action |
|----------|------|--------|
| Hero | `Colaboraciones` | Scroll to #contact |
| Navbar | `Hablemos` | Scroll to #contact |
| Blog section | `Ver todos` | → /blog |
| Gallery section | `Ver galería completa` | → /gallery |
| Newsletter | `Suscribirme` | Submit subscription |
| Contact form | `Enviar mensaje` | Submit form |
| Contact success | `Enviar otro mensaje` | Reset form |
| Footer strip | `Iniciar conversación` | Scroll to #contact |

## Admin Panel CTAs

### Posts
| Text | Context |
|------|---------|
| `Nuevo post` | Create new post |
| `Guardar` | Save draft/changes |
| `Publicar` | Change status to PUBLISHED |
| `Despublicar` | Change to DRAFT |
| `Archivar` | Change to ARCHIVED |
| `Eliminar` | Delete post (requires confirmation) |
| `Editar` | Edit post |
| `Generar artículo` | AI generation |
| `Generar imagen de portada` | DALL-E cover |

### Ideas IA
| Text | Context |
|------|---------|
| `Generar ideas` | Run AI idea generator |
| `Crear post` | Use idea → new post |
| `Guardar` | Save idea to local storage |
| `Copiar título` | Copy title to clipboard |

### Gallery
| Text | Context |
|------|---------|
| `Subir imágenes` | Open file picker |
| `Arrastra tus imágenes aquí` | Drop zone label |
| `Todas` / `En landing` / `Ocultas` | Filter tabs |
| `Editar alt` | Edit image alt text |
| `Eliminar` | Delete image (confirmation) |

### Booking Links
| Text | Context |
|------|---------|
| `+ Nuevo enlace` | Create new booking link |
| `Copiar enlace` | Copy public URL |
| `Activar` / `Desactivar` | Toggle link active state |
| `Eliminar` | Delete with confirmation |

### Bookings
| Text | Context |
|------|---------|
| `Todas` / `Confirmadas` / `Canceladas` / `Completadas` | Filter tabs |
| `Cancelar` | Cancel booking |
| `Reactivar` | Reactivate cancelled |
| `Eliminar` | Delete booking |

### Availability
| Text | Context |
|------|---------|
| `Guardar` | Save availability |
| `Lunes a Viernes (15:00–21:00)` | Preset button |
| `Fines de semana (10:00–14:00)` | Preset button |
| `Todos los días (09:00–18:00)` | Preset button |

### Event Pages (Landing Builder)
| Text | Context |
|------|---------|
| `+ Nueva landing page` | Create new page |
| `Crear pagina` | Confirm creation |
| `+ Agregar bloque` | Add block to page |
| `Vista previa` | Open public URL in new tab |
| `Publicar` / `Despublicar` | Toggle page status |
| `Duplicar` | Duplicate block |
| `Eliminar` | Delete block/page |

### Newsletter
| Text | Context |
|------|---------|
| `Nueva campaña` | Create campaign |
| `Enviar` | Send campaign |
| `Guardar borrador` | Save as draft |

### Settings
| Text | Context |
|------|---------|
| `Guardar` | Save settings tab |
| `Restablecer valores por defecto` | Reset to defaults |

### Contacts
| Text | Context |
|------|---------|
| `Responder por email` | Open mailto |
| `Archivar` | Change status to ARCHIVED |
| `Desarchivar` | Change back to READ |
| `Eliminar` | Delete contact |

### Auth
| Text | Context |
|------|---------|
| `Iniciar sesión` | Login button |
| `Cerrar sesión` | Logout |

### Knowledge Base
| Text | Context |
|------|---------|
| `Editar` | Open edit modal (DB mode only) |
| `Sincronizar con base de datos` | Seed KB to DB |
| `Guardar cambios` | Save edited article |
| `Cancelar` | Close modal |
| `Copiar` | Copy code to clipboard |

## Status Labels

### Post statuses
- `Borrador` — DRAFT
- `Publicado` — PUBLISHED
- `Archivado` — ARCHIVED

### Contact statuses
- `Pendiente` — PENDING
- `Leído` — READ
- `Respondido` — REPLIED
- `Archivado` — ARCHIVED

### Booking statuses
- `Confirmada` — CONFIRMED
- `Pendiente` — PENDING
- `Cancelada` — CANCELLED

### Event page statuses
- `Borrador` — DRAFT
- `Publicada` — PUBLISHED
- `Archivada` — ARCHIVED

### Campaign statuses
- `Borrador` — DRAFT
- `Enviada` — SENT

## Form Validation Messages (Spanish)

```
"Email inválido"
"Mínimo 8 caracteres"
"El título es obligatorio"
"El slug es obligatorio"
"Slug inválido (solo minúsculas, números y guiones)"
"El nombre es obligatorio"
"El asunto es obligatorio"
"El mensaje es obligatorio"
"El contenido es obligatorio"
"La URL es obligatoria"
"El key es obligatorio"
```

## Empty States

```
"No hay posts todavía"
"No hay imágenes en la galería"
"No hay enlaces de reserva"
"No hay reservas"
"No hay contactos"
"No hay landing pages"
"No hay campañas enviadas"
"No hay suscriptores"
"No se encontraron resultados"
"Próximamente — nuevos artículos en camino."
"Próximamente — nuevas fotos en camino."
```

## Success/Error Indicators

```
"Guardado"           → green check
"Guardando..."       → spinner gold dot
"Error al guardar"   → red warning
"Copiado!"           → green check (copy button)
"Enviado"            → green check
"Confirmada"         → green badge
"Cancelada"          → red badge
```

## Confirmations

```
"¿Eliminar este post? Esta acción no se puede deshacer."
"¿Eliminar este enlace? También se eliminarán todas las reservas asociadas."
"¿Eliminar esta imagen?"
"¿Eliminar esta landing page y todos sus bloques?"
"¿Eliminar este contacto permanentemente?"
"¿Cancelar esta reserva?"
```

## Loading/Processing States

```
"Cargando..."
"Generando artículo..."
"Generando imagen..."
"Subiendo..."
"Enviando..."
"Guardando..."
"Sincronizando..."
"Creando..."
```

## Form Placeholders (admin)

```
"Nombre del evento"         (landing slug)
"mi-evento"                 (slug)
"Título del artículo"       (post title)
"Resumen corto del artículo" (excerpt)
"Ej: consulta"              (booking link slug)
"Reserva tu cita"           (booking link title)
"Descripción opcional"      (description)
"llama3"                    (AI model)
"http://localhost:11434"    (ollama endpoint)
```
