# Deployment — Package.json & Scripts

## package.json

```json
{
  "name": "kikovargass",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:generate": "npx prisma generate",
    "db:migrate": "npx prisma migrate dev",
    "db:seed": "npx tsx prisma/seed.ts",
    "db:studio": "npx prisma studio"
  },
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.7.0",
    "@prisma/client": "^7.7.0",
    "@tiptap/extension-image": "^3.22.3",
    "@tiptap/extension-link": "^3.22.3",
    "@tiptap/extension-placeholder": "^3.22.3",
    "@tiptap/extension-underline": "^3.22.3",
    "@tiptap/pm": "^3.22.3",
    "@tiptap/react": "^3.22.3",
    "@tiptap/starter-kit": "^3.22.3",
    "bcryptjs": "^3.0.3",
    "framer-motion": "^12.38.0",
    "jsonwebtoken": "^9.0.3",
    "next": "16.2.3",
    "pg": "^8.20.0",
    "prisma": "^7.7.0",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "resend": "^6.11.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/pg": "^8.20.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.3",
    "tailwindcss": "^4",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
```

## Dependency Highlights

### Framework
- **next@16.2.3** — App Router, Server Components, standalone output
- **react@19.2.4** + **react-dom@19.2.4** — Latest stable React

### Database
- **prisma@7.7.0** — Schema + CLI
- **@prisma/client@7.7.0** — Generated client
- **@prisma/adapter-pg@7.7.0** — PostgreSQL adapter
- **pg@8.20.0** — PostgreSQL driver

### Auth
- **jsonwebtoken@9.0.3** — JWT signing/verification
- **bcryptjs@3.0.3** — Password hashing

### Email
- **resend@6.11.0** — Transactional email

### Validation
- **zod@4.3.6** — Runtime type checking

### Editor
- **@tiptap/react@3.22.3** — React wrapper
- **@tiptap/starter-kit** — Basic extensions (bold, italic, etc.)
- **@tiptap/extension-image** — Image embeds
- **@tiptap/extension-link** — Link support
- **@tiptap/extension-placeholder** — Placeholder text
- **@tiptap/extension-underline** — Underline formatting

### UI
- **framer-motion@12.38.0** — Animation library
- **tailwindcss@4** + **@tailwindcss/postcss** — Styling

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      { "name": "next" }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

## prisma.config.ts

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

## eslint.config.mjs

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

## postcss.config.mjs

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## .gitignore (essential lines)

```
# Next.js
.next/
out/

# Dependencies
node_modules/

# Environment
.env
.env.local

# Prisma
src/generated/prisma/

# Uploads
public/uploads/
uploads/

# TypeScript
*.tsbuildinfo

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
```

## npm scripts usage

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run start        # Start production server (after build)
npm run lint         # Run ESLint

# Prisma
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:migrate   # Create + apply a new migration (dev)
npm run db:seed      # Run seed script (creates admin user)
npm run db:studio    # Open Prisma Studio (DB GUI)
```

## Seed script

**File:** `prisma/seed.ts`

Creates the initial admin user. Should be run once after first deployment:
```bash
npx tsx prisma/seed.ts
```

Typical seed pseudocode:
```typescript
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@kikovargass.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "changeme12345678";

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashed,
      name: "Admin",
      role: "ADMIN"
    }
  });

  console.log(`✓ Admin user created: ${email}`);
  console.log(`  Temp password: ${password}`);
  console.log(`  IMPORTANT: change this immediately after first login!`);
}

main();
```
