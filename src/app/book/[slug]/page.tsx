import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const link = await prisma.bookingLink.findUnique({
    where: { slug },
  });

  if (!link) return notFound();

  // Check if active
  if (!link.active) {
    return <BookingError title="Enlace desactivado" message="Este enlace de reserva no esta disponible actualmente." />;
  }

  // Check if expired
  if (link.expiresAt && link.expiresAt < new Date()) {
    return <BookingError title="Enlace expirado" message="Este enlace de reserva ha expirado." />;
  }

  // Get availability
  const availability = await prisma.availability.findMany({
    where: { active: true },
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <BookingClient
      link={{
        slug: link.slug,
        title: link.title,
        description: link.description,
        duration: link.duration,
      }}
      availability={availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      }))}
    />
  );
}

function BookingError({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
          <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-[#888] text-sm">{message}</p>
      </div>
    </div>
  );
}
