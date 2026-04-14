# Deployment Guide — kikovargass.com

Complete guide for running this project locally, with Docker, or on a VPS.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [VPS Deployment](#vps-deployment)
5. [Production Operations](#production-operations)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | What it's for |
|------|---------|---------------|
| Node.js | 18+ | Runtime |
| npm | 9+ | Package manager |
| PostgreSQL | 15+ | Database |
| Docker | 24+ | Container deployment |
| Docker Compose | 2.20+ | Multi-container orchestration |
| Git | 2.30+ | Version control |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-user/kikovargass.git
cd kikovargass
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Your local PostgreSQL connection
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/kikovargass?schema=public"

# Any string with 32+ characters
JWT_SECRET="your-secret-key-at-least-32-characters-long"

# Optional — leave empty if you don't need email
RESEND_API_KEY=""

# Optional — leave empty if you don't need uploads
UPLOADTHING_TOKEN=""
```

### 4. Create the database

Make sure PostgreSQL is running locally, then:

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE kikovargass;"
```

If you're on Windows and don't have `psql` in your PATH, use pgAdmin or your preferred GUI to create a database named `kikovargass`.

### 5. Generate Prisma client and run migrations

```bash
# Generate the Prisma client
npm run db:generate

# Apply all migrations
npm run db:migrate
```

### 6. Seed the database (optional)

Creates a default admin user (`admin@kikovargass.com` / `Admin2024!`) and sample data:

```bash
npm run db:seed
```

### 7. Start the dev server

```bash
npm run dev
```

The app is now running at `http://localhost:3000`.

### Useful commands during development

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:migrate   # Create and apply new migrations
npm run db:seed      # Seed database with sample data
```

---

## Docker Deployment

### 1. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with production values. At minimum:

```env
POSTGRES_PASSWORD="a-strong-random-password"
JWT_SECRET="run-openssl-rand-base64-48-to-generate"

# Change if port 3000 is already used by another project
APP_PORT="3000"
```

Generate secure values:

```bash
# Generate a secure password
openssl rand -base64 32

# Generate a JWT secret
openssl rand -base64 48
```

### 2. Build and start

```bash
docker compose up -d --build
```

This will:
- Build the Next.js app image (multi-stage, ~150MB)
- Start a PostgreSQL 16 container with persistent data
- Wait for PostgreSQL to be healthy
- Run Prisma migrations automatically
- Start the Next.js server on port 3000

### 3. Verify it's running

```bash
# Check container status
docker compose ps

# Check app logs
docker compose logs app

# You should see:
# [entrypoint] Waiting for PostgreSQL at db:5432...
# [entrypoint] PostgreSQL is accepting connections.
# [entrypoint] Running Prisma migrations...
# [entrypoint] Migrations applied successfully.
# [entrypoint] Starting application...
```

Visit `http://localhost:3000` to confirm.

### 4. Seed the database (first time only)

```bash
docker compose exec app npx prisma db seed
```

This creates the default admin user. You can then log in at `/login` with:
- Email: `admin@kikovargass.com`
- Password: `Admin2024!`

**Change the admin password after your first login.**

### 5. Stop the containers

```bash
docker compose down
```

To stop AND delete the database volume (destroys all data):

```bash
docker compose down -v
```

---

## VPS Deployment

Step-by-step for a fresh Ubuntu/Debian VPS.

### 1. Connect to your server

```bash
ssh root@your-server-ip
```

### 2. Install Docker

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

### 3. Create a non-root user (recommended)

```bash
adduser deploy
usermod -aG docker deploy
su - deploy
```

### 4. Clone the repository

```bash
git clone https://github.com/your-user/kikovargass.git
cd kikovargass
```

### 5. Configure environment

```bash
cp .env.example .env
nano .env
```

Set production values:

```env
POSTGRES_PASSWORD="<generate with: openssl rand -base64 32>"
JWT_SECRET="<generate with: openssl rand -base64 48>"
RESEND_API_KEY="re_xxxxx"
CONTACT_EMAIL_TO="contacto@kikovargass.com"
UPLOADTHING_TOKEN="<your token>"
```

### 6. Build and start

```bash
docker compose up -d --build
```

### 7. Seed the database

```bash
docker compose exec app npx prisma db seed
```

### 8. Set up a reverse proxy (optional but recommended)

If you want HTTPS with a custom domain, install Nginx and Certbot:

```bash
# As root
apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/kikovargass`:

```nginx
server {
    server_name kikovargass.com www.kikovargass.com;

    location / {
        proxy_pass http://127.0.0.1:3000;  # Match APP_PORT in .env
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get SSL:

```bash
ln -s /etc/nginx/sites-available/kikovargass /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Get free SSL certificate
certbot --nginx -d kikovargass.com -d www.kikovargass.com
```

### 9. Set up firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Production Operations

### Restart containers

```bash
# Restart everything
docker compose restart

# Restart only the app (keeps DB running)
docker compose restart app
```

### Update the app

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (zero-downtime with rolling update)
docker compose up -d --build

# The entrypoint will automatically run any new migrations
```

### Check logs

```bash
# All services
docker compose logs

# App only, follow mode
docker compose logs -f app

# Last 100 lines
docker compose logs --tail 100 app

# Database logs
docker compose logs -f db
```

### Access the database

```bash
# Open psql inside the container
docker compose exec db psql -U postgres -d kikovargass

# Run a quick query
docker compose exec db psql -U postgres -d kikovargass -c "SELECT count(*) FROM contacts;"
```

### Open Prisma Studio (GUI)

```bash
docker compose exec app npx prisma studio
```

Note: Prisma Studio binds to port 5555. You may need to forward it if running on a remote server:

```bash
ssh -L 5555:localhost:5555 deploy@your-server-ip
```

### Database backup

```bash
# Create a backup
docker compose exec db pg_dump -U postgres kikovargass > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker compose exec db pg_dump -U postgres -Fc kikovargass > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore a backup

```bash
# From SQL file
cat backup_20260414.sql | docker compose exec -T db psql -U postgres -d kikovargass

# From compressed dump
cat backup_20260414.dump | docker compose exec -T db pg_restore -U postgres -d kikovargass --clean --if-exists
```

### Automated daily backups (cron)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 3 AM, keeps last 30 days)
0 3 * * * cd /home/deploy/kikovargass && docker compose exec -T db pg_dump -U postgres -Fc kikovargass > /home/deploy/backups/db_$(date +\%Y\%m\%d).dump && find /home/deploy/backups -name "db_*.dump" -mtime +30 -delete
```

Create the backups directory:

```bash
mkdir -p /home/deploy/backups
```

---

## Troubleshooting

### App won't start — "DATABASE_URL is not set"

The `.env` file is missing or not being read.

```bash
# Verify .env exists and has the right values
cat .env | grep DATABASE_URL

# Make sure there are no extra spaces around the = sign
# Correct:   DATABASE_URL="postgresql://..."
# Wrong:     DATABASE_URL = "postgresql://..."
```

### App won't start — "JWT_SECRET is required"

Docker Compose requires `JWT_SECRET` to be set. Make sure it's in your `.env` file and is at least 32 characters long.

```bash
# Generate one
openssl rand -base64 48
```

### Database connection refused

```bash
# Check if the DB container is running
docker compose ps db

# Check DB logs
docker compose logs db

# If the container is restarting, the password may have changed
# after the volume was created. Reset with:
docker compose down -v   # WARNING: deletes all data
docker compose up -d --build
```

### Prisma migration errors

**"Migration failed to apply":**

```bash
# Check which migrations have been applied
docker compose exec app npx prisma migrate status

# If there's a failed migration, check the error
docker compose logs app | grep -A 5 "migrate"

# Force reset (WARNING: deletes all data)
docker compose exec app npx prisma migrate reset --force
```

**"Prisma client not generated":**

This happens if the Docker build cache is stale.

```bash
# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Port 3000 already in use

```bash
# Find what's using the port
lsof -i :3000

# Change APP_PORT in .env to use a different port:
# APP_PORT=8080
```

### Container keeps restarting

```bash
# Check the exit code
docker compose ps

# Read the full logs
docker compose logs app --tail 200

# Common causes:
# - Missing environment variables
# - Database not reachable
# - Failed migrations
```

### "Permission denied" on docker commands

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Then log out and log back in
exit
ssh deploy@your-server-ip
```

### Running out of disk space

```bash
# Check disk usage
df -h

# Clean unused Docker resources
docker system prune -a --volumes

# Remove old backups
find /home/deploy/backups -name "*.dump" -mtime +7 -delete
```

### Checking container health

```bash
# View health status
docker inspect --format='{{.State.Health.Status}}' kikovargas-app

# View last health check result
docker inspect --format='{{json .State.Health.Log}}' kikovargas-app | python3 -m json.tool
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `POSTGRES_PASSWORD` | Yes (Docker) | — | Password for the PostgreSQL container |
| `JWT_SECRET` | Yes | — | Secret for JWT tokens (min 32 chars) |
| `RESEND_API_KEY` | No | — | Resend API key for email notifications |
| `CONTACT_EMAIL_TO` | No | `contacto@kikovargass.com` | Email for contact form notifications |
| `UPLOADTHING_TOKEN` | No | — | UploadThing token for image uploads |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `APP_PORT` | No | `3000` | External port for the app (Docker) |
| `DB_WAIT_RETRIES` | No | `30` | Max retries waiting for DB (Docker) |
| `DB_WAIT_INTERVAL` | No | `2` | Seconds between DB retries (Docker) |
