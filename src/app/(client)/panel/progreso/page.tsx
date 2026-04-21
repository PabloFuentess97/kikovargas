import { requireClientArea } from "@/lib/auth/client-access";
import { prisma } from "@/lib/db/prisma";
import { ProgressClient } from "./progress-client";

export const dynamic = "force-dynamic";

export default async function ClientProgressPage() {
  const { session } = await requireClientArea("progress");

  const [user, checkIns] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { name: true, heightCm: true, startedAt: true },
    }),
    prisma.clientCheckIn.findMany({
      where: { clientId: session.sub },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <ProgressClient
      heightCm={user?.heightCm ?? null}
      initialCheckIns={JSON.parse(JSON.stringify(checkIns))}
      startedAt={user?.startedAt ? new Date(user.startedAt).toISOString() : null}
    />
  );
}
