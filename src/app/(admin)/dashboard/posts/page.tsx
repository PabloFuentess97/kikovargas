import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { DeletePostButton } from "./delete-post-button";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  PageHeader, PostStatusBadge, LinkButton,
} from "@/components/admin/ui";

const IconPlus = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const IconDoc = (
  <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default async function PostsPage() {
  await requireAdmin();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Posts"
        subtitle={`${posts.length} entradas en el blog`}
        action={
          <LinkButton href="/dashboard/posts/new" icon={IconPlus}>
            Nuevo post
          </LinkButton>
        }
      />

      <Table>
        <TableHead>
          <TableHeader>Titulo</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader className="hidden sm:table-cell">Autor</TableHeader>
          <TableHeader className="hidden md:table-cell">Fecha</TableHeader>
          <TableHeader align="right">Acciones</TableHeader>
        </TableHead>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>
                <Link href={`/dashboard/posts/${post.id}`} className="group">
                  <p className="font-medium group-hover:text-a-accent transition-colors">{post.title}</p>
                  <p className="mt-0.5 text-xs text-muted font-mono">/{post.slug}</p>
                </Link>
              </TableCell>
              <TableCell>
                <PostStatusBadge status={post.status} />
              </TableCell>
              <TableCell className="text-muted hidden sm:table-cell">{post.author.name}</TableCell>
              <TableCell className="text-muted hidden md:table-cell">
                {new Date(post.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <LinkButton href={`/dashboard/posts/${post.id}`} variant="secondary" size="sm">
                    Editar
                  </LinkButton>
                  <DeletePostButton postId={post.id} postTitle={post.title} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 && (
            <TableEmpty
              colSpan={5}
              icon={IconDoc}
              message="No hay posts todavia"
              action={
                <Link href="/dashboard/posts/new" className="text-xs font-medium text-a-accent hover:text-a-accent-hover">
                  Crea el primero &rarr;
                </Link>
              }
            />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
