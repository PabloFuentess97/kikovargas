# 02 · Desplegar con Docker

Guía paso a paso para desplegar el proyecto en un VPS usando Docker Compose. Asume deploy en producción con dominio propio.

## Requisitos del VPS

- **OS:** Ubuntu 22.04+ o Debian 12+
- **RAM:** mínimo 2 GB (recomendado 4 GB)
- **Disco:** mínimo 20 GB
- **Acceso:** SSH con usuario sudo
- **Dominio:** con DNS apuntando a la IP del VPS (`A record`)
- **Puertos abiertos:** 22 (SSH), 80, 443

## Primera vez — instalación completa

### 1. Conectarse al VPS

```bash
ssh usuario@tu-vps-ip
```

### 2. Instalar Docker (si no está)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker   # aplicar el grupo sin tener que logout
docker --version
docker compose version
```

### 3. Clonar el repositorio

```bash
sudo mkdir -p /opt
sudo chown $USER:$USER /opt
cd /opt
git clone https://github.com/PabloFuentess97/kikovargas.git
cd kikovargas
```

### 4. Preparar variables de entorno

```bash
cp .env.example .env
nano .env
```

**Valores críticos para producción:**

```bash
# DB — contraseña fuerte, mínimo 16 chars mixed
POSTGRES_PASSWORD="$(openssl rand -base64 24)"
DATABASE_URL="postgresql://postgres:XXXXXXX@db:5432/kikovargass?schema=public"
# ↑ Copiar el mismo valor de POSTGRES_PASSWORD donde dice XXXXXXX

# JWT — min 32 chars, único por ambiente
JWT_SECRET="$(openssl rand -base64 48)"

# Encryption — distinto del JWT
ENCRYPTION_KEY="$(openssl rand -base64 48)"

# Email (opcional pero recomendado)
RESEND_API_KEY="re_..."
CONTACT_EMAIL_TO="contacto@kikovargass.com"

# App
NODE_ENV="production"
NEXT_PUBLIC_URL="https://kikovargass.com"
APP_PORT="3000"
```

**Verifica que `DATABASE_URL` use `@db:5432`** (hostname del servicio Docker), no `localhost`.

### 5. Preparar directorio de uploads

```bash
mkdir -p uploads
sudo chown -R 1001:1001 uploads
sudo chmod -R 755 uploads
```

El UID 1001 corresponde al usuario `nextjs` del contenedor. Sin esto, el contenedor no puede escribir.

### 6. Build de la imagen

```bash
docker compose build
```

Primera vez: 3-5 minutos. Descarga la imagen base `node:20-alpine` y ejecuta `npm ci` + `next build`.

### 7. Levantar el stack

```bash
docker compose up -d
```

Verifica:

```bash
docker compose ps
# Debería mostrar:
#   kikovargas-db    running (healthy)
#   kikovargas-app   running (healthy)
```

Si `app` está `unhealthy`:
```bash
docker compose logs app
```

### 8. Ver el arranque

```bash
docker compose logs -f app
```

Deberías ver:
```
[entrypoint] Validating environment variables...
[entrypoint] Environment OK.
[entrypoint] Waiting for PostgreSQL at db:5432...
[entrypoint] PostgreSQL is accepting connections.
[entrypoint] Running Prisma migrations (attempt 1/5)...
[entrypoint] Migrations applied successfully.
[entrypoint] Uploads directory OK (writable): /app/public/uploads
[entrypoint] Starting application...
   ▲ Next.js 16.2.3
   - Local:    http://0.0.0.0:3000
 ✓ Ready in 1.2s
```

Ctrl+C para salir de los logs (no detiene el contenedor).

### 9. Crear admin inicial

```bash
docker compose exec app npx tsx prisma/seed.ts
```

Salida:
```
✓ Admin user created: admin@kikovargass.com
  Temp password: changeme12345678
  IMPORTANT: change this immediately after first login!
```

**Cámbialo inmediatamente:**
1. Visita `http://tu-vps-ip:3000/login`.
2. Login con las credenciales por defecto.
3. Dashboard → Usuarios → cambia email/password (si hay UI) o:
   ```bash
   docker compose exec db psql -U postgres -d kikovargass
   UPDATE users SET email='nuevo@email.com' WHERE role='ADMIN';
   ```

### 10. Configurar reverse proxy con HTTPS

Sin reverse proxy, la app está accesible en `http://tu-vps-ip:3000` (HTTP puro, no es seguro para producción).

**Opción A — Caddy (recomendado, HTTPS automático):**

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

Editar `/etc/caddy/Caddyfile`:
```caddy
kikovargass.com {
    reverse_proxy localhost:3000
    encode gzip

    header {
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }
}

# Redirect www
www.kikovargass.com {
    redir https://kikovargass.com{uri} permanent
}
```

Recargar:
```bash
sudo caddy reload --config /etc/caddy/Caddyfile
```

Caddy gestiona HTTPS con Let's Encrypt automáticamente.

**Opción B — Nginx:**
```bash
sudo apt install nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/kikovargas
```

Contenido:
```nginx
server {
    server_name kikovargass.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        client_max_body_size 10M;   # permite uploads hasta 10MB
    }

    listen 80;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kikovargas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# HTTPS con Certbot
sudo certbot --nginx -d kikovargass.com
```

### 11. Configurar firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

**No abrir el puerto 3000 al público.** Solo debe accederse a través del reverse proxy.

### 12. Verificación final

```bash
# Responde HTTPS
curl -I https://kikovargass.com

# Dashboard carga
curl -I https://kikovargass.com/dashboard   # debería redirigir a /login

# Login funciona
# Visita https://kikovargass.com/login en el navegador
```

## Actualizaciones

### Deploy de una nueva versión

```bash
cd /opt/kikovargas
git pull origin main
docker compose build app
docker compose up -d app

# Ver logs para confirmar
docker compose logs -f app
```

**Downtime:** 5-15 segundos (tiempo de build local + recreación de contenedor).

### Con migraciones de DB

Si el `git pull` incluye nuevas migraciones:
```bash
docker compose up -d app   # el entrypoint aplica migraciones automáticamente
```

No requiere paso manual — `docker-entrypoint.sh` corre `prisma migrate deploy` en cada startup.

### Si algo sale mal — rollback

```bash
# Ver commits recientes
cd /opt/kikovargas
git log --oneline -10

# Volver al commit anterior
git checkout <commit-hash>
docker compose build app
docker compose up -d app
```

**Cuidado con migraciones:** Prisma migrate deploy solo aplica forward, no hace rollback. Si la versión anterior espera un schema viejo pero la DB ya está en el schema nuevo, puede fallar. En ese caso, hay que escribir una migración manual de rollback.

## Backups

### Automático (cron)

Archivo `/etc/cron.daily/backup-kikovargas`:
```bash
#!/bin/bash
set -e

BACKUP_DIR=/var/backups/kikovargas
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

cd /opt/kikovargas

# Backup DB
docker compose exec -T db pg_dump -U postgres kikovargass | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Backup uploads
tar czf $BACKUP_DIR/uploads-$DATE.tar.gz uploads/

# Keep last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: $BACKUP_DIR"
```

Permisos:
```bash
sudo chmod +x /etc/cron.daily/backup-kikovargas
```

### Backup manual

```bash
cd /opt/kikovargas
docker compose exec -T db pg_dump -U postgres kikovargass | gzip > backup-$(date +%Y%m%d).sql.gz
tar czf uploads-$(date +%Y%m%d).tar.gz uploads/
```

### Restaurar

**DB:**
```bash
# ⚠️ CUIDADO: sobrescribe la DB actual
gunzip -c backup-YYYYMMDD.sql.gz | docker compose exec -T db psql -U postgres kikovargass
```

**Uploads:**
```bash
tar xzf uploads-YYYYMMDD.tar.gz
sudo chown -R 1001:1001 uploads/
```

### Backup offsite (recomendado)

Copiar los archivos a S3/Backblaze/Wasabi:
```bash
# Instalar rclone
curl https://rclone.org/install.sh | sudo bash
rclone config   # configurar remote

# Añadir al cron:
rclone copy /var/backups/kikovargas remote:kikovargas-backups/
```

## Monitoreo básico

### Uptime con un servicio externo

- **UptimeRobot** (gratis, 5 min checks)
- **Hetzner Status** / **BetterStack**
- Configurar alertas por email/SMS

Endpoint de check:
```
https://kikovargass.com/api/auth/me
```
(Devuelve 401 pero responde, lo que confirma que la app está viva)

### Disco

```bash
df -h /opt/kikovargas/uploads

# Tamaño del DB
docker compose exec db psql -U postgres -d kikovargass -c "SELECT pg_size_pretty(pg_database_size('kikovargass'));"
```

Si `uploads/` crece mucho, considerar migración a S3 (ver `DOCS-TECNICA/15-future-improvements.md`).

## Seguridad post-deploy

### Checklist crítico

- [ ] Cambiar password del admin creado con seed
- [ ] Verificar HTTPS funcionando
- [ ] Firewall cerrado excepto 22/80/443
- [ ] Fail2ban instalado para SSH (`sudo apt install fail2ban`)
- [ ] Actualizaciones automáticas del sistema (`sudo apt install unattended-upgrades`)
- [ ] Backups probados (hacer un restore de prueba)
- [ ] Logs rotando (Caddy y journald por defecto rotan)

### Rotación de JWT_SECRET

**Consecuencia:** invalida todas las sesiones activas. Los usuarios deben loguearse de nuevo. **No** afecta las API keys cifradas (esas usan `ENCRYPTION_KEY`, si está set, o `JWT_SECRET` como fallback — verificar).

```bash
cd /opt/kikovargas
# Editar .env → nuevo JWT_SECRET
nano .env
# Reiniciar
docker compose restart app
```

## Comandos operacionales

### Ver logs

```bash
docker compose logs -f app      # app, seguir en tiempo real
docker compose logs -f db       # db
docker compose logs --tail 100 app   # últimas 100 líneas
docker compose logs --since 1h app   # última hora
```

### Reiniciar

```bash
docker compose restart app      # reinicia solo app
docker compose restart          # reinicia todo
```

### Detener

```bash
docker compose stop             # detiene, conserva datos
docker compose down             # detiene + elimina contenedores (conserva volúmenes)
docker compose down -v          # 🔥 detiene + elimina contenedores Y VOLÚMENES (DATOS)
```

### Shell dentro del contenedor

```bash
docker compose exec app sh      # alpine no tiene bash
docker compose exec db psql -U postgres -d kikovargass
```

### Ver uso de recursos

```bash
docker stats
```

### Limpiar imágenes viejas tras builds

```bash
docker image prune -f
docker builder prune -f
```

## Configuración inicial del cliente

Una vez desplegado, configurar en el panel:

1. **Configuración → IA:** pegar `OPENAI_API_KEY`, elegir modelo `gpt-4o-mini`.
2. **Configuración → Email:** pegar `RESEND_API_KEY`, verificar dominio en Resend.
3. **Configuración → Hero:** personalizar título, background.
4. **Configuración → Redes:** URLs de Instagram, YouTube, TikTok.
5. **Disponibilidad:** configurar horarios.
6. **Galería:** subir imágenes iniciales (marcar algunas como "Landing").
7. **Posts:** generar 2-3 posts iniciales con IA.
8. **Base de conocimiento → Sincronizar:** para poder editar desde el panel.

## Problemas frecuentes

Ver [`04-debugging.md`](./04-debugging.md) para troubleshooting detallado.
