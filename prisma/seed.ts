import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Admin User ───────────────────────────────────
  const adminEmail = "admin@kikovargass.com";
  const hashedPassword = await bcrypt.hash("Admin2024!", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log(`User: ${admin.email} (${admin.role})`);

  // ─── Sample Image ─────────────────────────────────
  const cover = await prisma.image.upsert({
    where: { key: "seed/cover-bienvenida.jpg" },
    update: {},
    create: {
      url: "/uploads/cover-bienvenida.jpg",
      key: "seed/cover-bienvenida.jpg",
      alt: "Imagen de bienvenida",
      width: 1200,
      height: 630,
      size: 102400,
      mime: "image/jpeg",
    },
  });

  console.log(`Image: ${cover.key}`);

  // ─── Sample Post ──────────────────────────────────
  const post = await prisma.post.upsert({
    where: { slug: "bienvenida" },
    update: {},
    create: {
      title: "Bienvenida al sitio",
      slug: "bienvenida",
      excerpt: "Este es el primer post del sitio.",
      content: "Contenido completo del post de bienvenida. Aquí irá el texto principal.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: admin.id,
      coverId: cover.id,
    },
  });

  console.log(`Post: ${post.title} (${post.status})`);

  // ─── Sample Contact ───────────────────────────────
  await prisma.contact.upsert({
    where: { id: "seed-contact-1" },
    update: {},
    create: {
      id: "seed-contact-1",
      name: "Juan Pérez",
      email: "juan@example.com",
      phone: "+52 555 123 4567",
      subject: "Consulta general",
      message: "Hola, me gustaría saber más sobre sus servicios.",
      status: "PENDING",
    },
  });

  console.log("Contact: seed message created");

  console.log("\nSeed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
