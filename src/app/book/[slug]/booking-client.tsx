"use client";

import { useState, useMemo, useCallback } from "react";

interface BookingLink {
  slug: string;
  title: string;
  description: string;
  duration: number;
}

interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface BookedSlot {
  time: string;
  duration: number;
}

type Step = "date" | "time" | "form" | "success";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function BookingClient({
  link,
  availability,
}: {
  link: BookingLink;
  availability: AvailabilitySlot[];
}) {
  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Calendar state
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Available days of week set
  const availableDays = useMemo(() => new Set(availability.map((a) => a.dayOfWeek)), [availability]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPad = firstDay.getDay(); // 0 = Sunday
    const days: (Date | null)[] = [];

    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(viewYear, viewMonth, d));
    }

    return days;
  }, [viewMonth, viewYear]);

  const isDayAvailable = useCallback(
    (date: Date) => {
      if (date < today) return false;
      return availableDays.has(date.getDay());
    },
    [availableDays, today],
  );

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  // Fetch booked slots when a date is selected
  async function handleDateSelect(date: Date) {
    setSelectedDate(date);
    setSelectedTime(null);
    setErrorMsg("");
    setLoadingSlots(true);

    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const res = await fetch(`/api/bookings/public?slug=${link.slug}&date=${dateStr}`);
      const json = await res.json();

      if (json.success) {
        setBookedSlots(json.data.bookedSlots || []);
      }
    } catch {
      console.error("Error fetching slots");
    }

    setLoadingSlots(false);
    setStep("time");
  }

  // Generate time slots for selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.getDay();
    const avail = availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!avail) return [];

    const [startH, startM] = avail.startTime.split(":").map(Number);
    const [endH, endM] = avail.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const slots: string[] = [];
    for (let m = startMinutes; m + link.duration <= endMinutes; m += link.duration) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }

    return slots;
  }, [selectedDate, availability, link.duration]);

  // Check if a time slot is booked
  const isSlotBooked = useCallback(
    (time: string) => {
      if (!selectedDate) return false;
      const [h, m] = time.split(":").map(Number);

      return bookedSlots.some((slot) => {
        const bookedDate = new Date(slot.time);
        const bookedH = bookedDate.getUTCHours();
        const bookedM = bookedDate.getUTCMinutes();
        const bookedStart = bookedH * 60 + bookedM;
        const bookedEnd = bookedStart + slot.duration;
        const slotStart = h * 60 + m;
        const slotEnd = slotStart + link.duration;

        return slotStart < bookedEnd && slotEnd > bookedStart;
      });
    },
    [bookedSlots, selectedDate, link.duration],
  );

  // Submit booking
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const [h, m] = selectedTime.split(":").map(Number);
      const bookingDate = new Date(Date.UTC(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        h,
        m,
      ));

      const res = await fetch("/api/bookings/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: link.slug,
          date: bookingDate.toISOString(),
          name,
          email,
          phone,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error || "Error al crear la reserva");
        setSubmitting(false);
        return;
      }

      setStep("success");
    } catch {
      setErrorMsg("Error de conexion. Intentalo de nuevo.");
    }

    setSubmitting(false);
  }

  // Navigate months
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-lg font-bold tracking-wider text-white">KIKO</span>
            <span className="text-lg font-bold tracking-wider text-[#c9a84c]">VARGAS</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{link.title}</h1>
          {link.description && (
            <p className="text-sm text-[#888]">{link.description}</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-3">
            <svg className="h-4 w-4 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-[#888]">{link.duration} minutos</span>
          </div>
        </div>

        {/* Steps indicator */}
        {step !== "success" && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["date", "time", "form"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full transition-colors ${
                  step === s ? "bg-[#c9a84c]" : i < ["date", "time", "form"].indexOf(step) ? "bg-[#c9a84c]/50" : "bg-[#333]"
                }`} />
                {i < 2 && <div className={`h-px w-8 ${
                  i < ["date", "time", "form"].indexOf(step) ? "bg-[#c9a84c]/50" : "bg-[#222]"
                }`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step: Date ── */}
        {step === "date" && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Selecciona una fecha</h2>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="text-sm font-medium text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
                <div key={d} className="text-center text-[0.65rem] font-medium text-[#555] py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`pad-${i}`} />;

                const available = isDayAvailable(day);
                const selected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);

                return (
                  <button
                    key={day.getTime()}
                    onClick={() => available && handleDateSelect(day)}
                    disabled={!available}
                    className={`
                      relative h-10 rounded-lg text-sm font-medium transition-all
                      ${available
                        ? selected
                          ? "bg-[#c9a84c] text-black"
                          : "text-white hover:bg-[#1a1a1a]"
                        : "text-[#333] cursor-not-allowed"
                      }
                    `}
                  >
                    {day.getDate()}
                    {isToday && !selected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#c9a84c]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Availability legend */}
            {availability.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
                <p className="text-[0.65rem] font-medium text-[#555] uppercase tracking-wider mb-2">Horarios disponibles</p>
                <div className="flex flex-wrap gap-2">
                  {availability.map((a) => (
                    <span key={a.dayOfWeek} className="text-[0.7rem] text-[#888] bg-[#111] px-2 py-1 rounded">
                      {DAY_NAMES[a.dayOfWeek].slice(0, 3)} {a.startTime}-{a.endTime}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Time ── */}
        {step === "time" && selectedDate && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <button onClick={() => { setStep("date"); setSelectedTime(null); }} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:underline mb-4">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Cambiar fecha
            </button>

            <h2 className="text-sm font-semibold text-white mb-1">Selecciona un horario</h2>
            <p className="text-xs text-[#888] mb-5 capitalize">
              {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
            </p>

            {loadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 border-2 border-[#333] border-t-[#c9a84c] rounded-full animate-spin" />
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-sm text-[#555] text-center py-8">No hay horarios disponibles para este dia.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => {
                  const booked = isSlotBooked(time);
                  const selected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      onClick={() => !booked && setSelectedTime(time)}
                      disabled={booked}
                      className={`
                        py-3 rounded-lg text-sm font-medium transition-all
                        ${booked
                          ? "bg-[#111] text-[#333] cursor-not-allowed line-through"
                          : selected
                            ? "bg-[#c9a84c] text-black"
                            : "bg-[#111] text-white hover:bg-[#1a1a1a] border border-[#1a1a1a]"
                        }
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTime && (
              <button
                onClick={() => setStep("form")}
                className="mt-6 w-full py-3 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b45f] transition-colors"
              >
                Continuar
              </button>
            )}
          </div>
        )}

        {/* ── Step: Form ── */}
        {step === "form" && selectedDate && selectedTime && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
            <button onClick={() => setStep("time")} className="flex items-center gap-1 text-xs text-[#c9a84c] hover:underline mb-4">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Cambiar horario
            </button>

            {/* Selected summary */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-[#111] border border-[#1a1a1a]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#c9a84c]/10">
                <svg className="h-5 w-5 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white capitalize">
                  {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
                </p>
                <p className="text-xs text-[#c9a84c] font-semibold">{selectedTime} · {link.duration} min</p>
              </div>
            </div>

            <h2 className="text-sm font-semibold text-white mb-4">Tus datos</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#888] mb-1.5">Telefono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="+34 600 000 000"
                />
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <p className="text-xs text-red-400">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b45f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Reservando...
                  </>
                ) : (
                  "Confirmar reserva"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === "success" && selectedDate && selectedTime && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Reserva confirmada!</h2>
            <p className="text-sm text-[#888] mb-6">Hemos enviado un email de confirmacion a <strong className="text-white">{email}</strong></p>

            <div className="inline-flex flex-col items-center gap-1 p-4 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <p className="text-sm font-medium text-white capitalize">
                {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
              </p>
              <p className="text-lg font-bold text-[#c9a84c]">{selectedTime}</p>
              <p className="text-xs text-[#666]">{link.duration} minutos · {link.title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
