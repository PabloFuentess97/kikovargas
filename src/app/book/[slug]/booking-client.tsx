"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";

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

/* ─── Helpers ────────────────────────────────────── */

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDurationLabel(time: string, durationMin: number): string {
  const [h, m] = time.split(":").map(Number);
  const endTotal = h * 60 + m + durationMin;
  const endH = Math.floor(endTotal / 60);
  const endM = endTotal % 60;
  return `${time} — ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/* ─── Skeleton component ─────────────────────────── */

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#1a1a1a] ${className}`} />;
}

/* ═══════════════════════════════════════════════════ */

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
  const [fetchError, setFetchError] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Double-submit guard
  const submitLock = useRef(false);
  // Abort controller for fetch cancellation
  const abortRef = useRef<AbortController | null>(null);

  // Calendar state
  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [now]);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Available days of week set
  const availableDays = useMemo(() => new Set(availability.map((a) => a.dayOfWeek)), [availability]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startPad = firstDay.getDay();
    const days: (Date | null)[] = [];

    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(viewYear, viewMonth, d));
    }

    return days;
  }, [viewMonth, viewYear]);

  // Check if a date is available (not past + has availability slot)
  const isDayAvailable = useCallback(
    (date: Date) => {
      if (date < today) return false;
      // If today, check if there's still time left in the availability window
      if (isSameDay(date, today)) {
        const avail = availability.find((a) => a.dayOfWeek === date.getDay());
        if (!avail) return false;
        const [endH, endM] = avail.endTime.split(":").map(Number);
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        // Need at least one full slot before closing
        if (nowMinutes + link.duration > endH * 60 + endM) return false;
      }
      return availableDays.has(date.getDay());
    },
    [availableDays, today, now, availability, link.duration],
  );

  // Is a date in the past (not today, strictly before)
  const isDayPast = useCallback(
    (date: Date) => date < today,
    [today],
  );

  // Prevent navigating to past months
  const canGoPrev = useMemo(() => {
    if (viewYear > today.getFullYear()) return true;
    if (viewYear === today.getFullYear() && viewMonth > today.getMonth()) return true;
    return false;
  }, [viewMonth, viewYear, today]);

  // Prevent navigating too far ahead (6 months)
  const canGoNext = useMemo(() => {
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 6);
    return new Date(viewYear, viewMonth + 1, 1) <= maxDate;
  }, [viewMonth, viewYear, today]);

  // ── Fetch booked slots when a date is selected ──
  async function handleDateSelect(date: Date) {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedDate(date);
    setSelectedTime(null);
    setErrorMsg("");
    setFetchError(false);
    setLoadingSlots(true);
    setStep("time");

    try {
      const res = await fetch(
        `/api/bookings/public?slug=${link.slug}&date=${toDateStr(date)}`,
        { signal: controller.signal },
      );
      const json = await res.json();

      if (!controller.signal.aborted) {
        if (json.success) {
          setBookedSlots(json.data.bookedSlots || []);
        } else {
          setFetchError(true);
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) setFetchError(true);
    }

    if (!controller.signal.aborted) setLoadingSlots(false);
  }

  // Cleanup abort on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // ── Generate VALID time slots (filters past times for today) ──
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek = selectedDate.getDay();
    const avail = availability.find((a) => a.dayOfWeek === dayOfWeek);
    if (!avail) return [];

    const [startH, startM] = avail.startTime.split(":").map(Number);
    const [endH, endM] = avail.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // For today: only show slots that haven't started yet
    const isToday = isSameDay(selectedDate, today);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slots: string[] = [];
    for (let m = startMinutes; m + link.duration <= endMinutes; m += link.duration) {
      // Skip past slots for today
      if (isToday && m <= nowMinutes) continue;

      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }

    return slots;
  }, [selectedDate, availability, link.duration, today, now]);

  // ── Count available (not booked) slots ──
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

  const availableSlotCount = useMemo(
    () => timeSlots.filter((t) => !isSlotBooked(t)).length,
    [timeSlots, isSlotBooked],
  );

  // ── Re-verify availability before submit ──
  async function verifySlotStillFree(): Promise<boolean> {
    if (!selectedDate || !selectedTime) return false;

    try {
      const res = await fetch(`/api/bookings/public?slug=${link.slug}&date=${toDateStr(selectedDate)}`);
      const json = await res.json();

      if (!json.success) return false;

      const freshSlots: BookedSlot[] = json.data.bookedSlots || [];
      const [h, m] = selectedTime.split(":").map(Number);

      const conflict = freshSlots.some((slot) => {
        const bookedDate = new Date(slot.time);
        const bookedH = bookedDate.getUTCHours();
        const bookedM = bookedDate.getUTCMinutes();
        const bookedStart = bookedH * 60 + bookedM;
        const bookedEnd = bookedStart + slot.duration;
        const slotStart = h * 60 + m;
        const slotEnd = slotStart + link.duration;
        return slotStart < bookedEnd && slotEnd > bookedStart;
      });

      if (conflict) {
        // Refresh local state so UI reflects reality
        setBookedSlots(freshSlots);
      }

      return !conflict;
    } catch {
      // On network error, let the server-side check catch it
      return true;
    }
  }

  // ── Submit booking (with double-submit guard + re-verification) ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    // Double-submit guard
    if (submitLock.current || submitting) return;
    submitLock.current = true;
    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Re-verify the slot is still free
      const stillFree = await verifySlotStillFree();
      if (!stillFree) {
        setErrorMsg("Este horario acaba de ser reservado por otra persona. Por favor, elige otro horario.");
        setSelectedTime(null);
        setStep("time");
        setSubmitting(false);
        submitLock.current = false;
        return;
      }

      // 2. Create booking
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
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Handle specific conflict (409) — someone booked between verify and submit
        if (res.status === 409) {
          setErrorMsg("Este horario acaba de ser reservado. Selecciona otro horario.");
          setSelectedTime(null);
          // Refresh slots
          handleDateSelect(selectedDate);
          setStep("time");
        } else {
          setErrorMsg(json.error || "Error al crear la reserva");
        }
        setSubmitting(false);
        submitLock.current = false;
        return;
      }

      setStep("success");
    } catch {
      setErrorMsg("Error de conexion. Intentalo de nuevo.");
    }

    setSubmitting(false);
    submitLock.current = false;
  }

  // Navigate months
  function prevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  // Retry fetch
  function retryFetch() {
    if (selectedDate) handleDateSelect(selectedDate);
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
          <div className="flex items-center justify-center gap-1 mb-8">
            {(["date", "time", "form"] as const).map((s, i) => {
              const stepIdx = ["date", "time", "form"].indexOf(step);
              const isDone = i < stepIdx;
              const isCurrent = i === stepIdx;
              const labels = ["Fecha", "Hora", "Datos"];

              return (
                <div key={s} className="flex items-center gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6rem] font-bold transition-all duration-300 ${
                      isCurrent
                        ? "bg-[#c9a84c] text-black scale-110"
                        : isDone
                          ? "bg-[#c9a84c]/30 text-[#c9a84c]"
                          : "bg-[#1a1a1a] text-[#444]"
                    }`}>
                      {isDone ? (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[0.65rem] font-medium hidden sm:inline ${
                      isCurrent ? "text-[#c9a84c]" : isDone ? "text-[#888]" : "text-[#444]"
                    }`}>{labels[i]}</span>
                  </div>
                  {i < 2 && <div className={`h-px w-6 sm:w-10 mx-1 transition-colors ${isDone ? "bg-[#c9a84c]/40" : "bg-[#1a1a1a]"}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Step: Date ── */}
        {step === "date" && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 animate-in">
            <h2 className="text-sm font-semibold text-white mb-4">Selecciona una fecha</h2>

            {/* No availability warning */}
            {availability.length === 0 && (
              <div className="rounded-xl bg-[#111] border border-[#1a1a1a] p-6 text-center">
                <svg className="h-8 w-8 text-[#333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="text-sm text-[#555]">No hay horarios disponibles actualmente.</p>
                <p className="text-xs text-[#444] mt-1">Contacta directamente para agendar tu cita.</p>
              </div>
            )}

            {availability.length > 0 && (
              <>
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    className={`p-2 rounded-lg transition-colors ${
                      canGoPrev ? "text-[#888] hover:text-white hover:bg-[#1a1a1a]" : "text-[#222] cursor-not-allowed"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-white">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                  <button
                    onClick={nextMonth}
                    disabled={!canGoNext}
                    className={`p-2 rounded-lg transition-colors ${
                      canGoNext ? "text-[#888] hover:text-white hover:bg-[#1a1a1a]" : "text-[#222] cursor-not-allowed"
                    }`}
                  >
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
                    const past = isDayPast(day);
                    const selected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, today);

                    return (
                      <button
                        key={day.getTime()}
                        onClick={() => available && handleDateSelect(day)}
                        disabled={!available}
                        aria-label={`${DAY_NAMES[day.getDay()]} ${day.getDate()} de ${MONTH_NAMES[day.getMonth()]}${!available ? " - No disponible" : ""}`}
                        className={`
                          relative h-10 rounded-lg text-sm font-medium transition-all duration-200
                          ${available
                            ? selected
                              ? "bg-[#c9a84c] text-black ring-2 ring-[#c9a84c]/30"
                              : "text-white hover:bg-[#c9a84c]/10 hover:text-[#c9a84c]"
                            : past
                              ? "text-[#222] cursor-not-allowed"
                              : "text-[#333] cursor-not-allowed"
                          }
                        `}
                      >
                        {day.getDate()}
                        {isToday && (
                          <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${
                            selected ? "bg-black" : "bg-[#c9a84c]"
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Availability legend */}
                <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
                  <p className="text-[0.65rem] font-medium text-[#555] uppercase tracking-wider mb-2">Horarios disponibles</p>
                  <div className="flex flex-wrap gap-2">
                    {availability.map((a) => (
                      <span key={a.dayOfWeek} className="text-[0.7rem] text-[#888] bg-[#111] px-2.5 py-1 rounded-md border border-[#1a1a1a]">
                        {DAY_NAMES[a.dayOfWeek].slice(0, 3)} {a.startTime}–{a.endTime}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step: Time ── */}
        {step === "time" && selectedDate && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 animate-in">
            <button
              onClick={() => { setStep("date"); setSelectedTime(null); setErrorMsg(""); }}
              className="flex items-center gap-1.5 text-xs text-[#c9a84c] hover:underline mb-4 group"
            >
              <svg className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Cambiar fecha
            </button>

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white">Selecciona un horario</h2>
              {!loadingSlots && !fetchError && (
                <span className="text-[0.65rem] text-[#555]">
                  {availableSlotCount} {availableSlotCount === 1 ? "disponible" : "disponibles"}
                </span>
              )}
            </div>
            <p className="text-xs text-[#888] mb-5 capitalize">
              {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </p>

            {/* Loading skeleton */}
            {loadingSlots && (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-[52px]" />
                ))}
              </div>
            )}

            {/* Fetch error */}
            {!loadingSlots && fetchError && (
              <div className="text-center py-8">
                <svg className="h-8 w-8 text-red-400/50 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-[#555] mb-3">Error al cargar los horarios</p>
                <button
                  onClick={retryFetch}
                  className="text-xs text-[#c9a84c] hover:underline font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* No available slots */}
            {!loadingSlots && !fetchError && timeSlots.length === 0 && (
              <div className="text-center py-8">
                <svg className="h-8 w-8 text-[#333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-[#555]">No hay horarios disponibles para este dia.</p>
                <button
                  onClick={() => { setStep("date"); setSelectedTime(null); }}
                  className="mt-3 text-xs text-[#c9a84c] hover:underline font-medium"
                >
                  Elegir otra fecha
                </button>
              </div>
            )}

            {/* All booked */}
            {!loadingSlots && !fetchError && timeSlots.length > 0 && availableSlotCount === 0 && (
              <div className="text-center py-8">
                <svg className="h-8 w-8 text-[#333] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-sm text-[#555]">Todos los horarios estan ocupados.</p>
                <button
                  onClick={() => { setStep("date"); setSelectedTime(null); }}
                  className="mt-3 text-xs text-[#c9a84c] hover:underline font-medium"
                >
                  Elegir otra fecha
                </button>
              </div>
            )}

            {/* Time slots grid */}
            {!loadingSlots && !fetchError && availableSlotCount > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const booked = isSlotBooked(time);
                    const selected = selectedTime === time;

                    if (booked) return null; // Hide booked slots entirely — cleaner UX

                    return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          py-3 rounded-lg text-sm font-medium transition-all duration-200 border
                          ${selected
                            ? "bg-[#c9a84c] text-black border-[#c9a84c] ring-2 ring-[#c9a84c]/30"
                            : "bg-[#111] text-white border-[#1a1a1a] hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5"
                          }
                        `}
                      >
                        <span className="block text-sm font-semibold">{time}</span>
                        <span className={`block text-[0.6rem] mt-0.5 ${selected ? "text-black/60" : "text-[#555]"}`}>
                          {link.duration} min
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Conflict error from submission */}
                {errorMsg && (
                  <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 animate-in">
                    <p className="text-xs text-red-400">{errorMsg}</p>
                  </div>
                )}

                {selectedTime && (
                  <button
                    onClick={() => { setErrorMsg(""); setStep("form"); }}
                    className="mt-6 w-full py-3 rounded-xl bg-[#c9a84c] text-black text-sm font-semibold hover:bg-[#d4b45f] transition-colors"
                  >
                    Continuar — {addDurationLabel(selectedTime, link.duration)}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Step: Form ── */}
        {step === "form" && selectedDate && selectedTime && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 animate-in">
            <button
              onClick={() => { setStep("time"); setErrorMsg(""); }}
              className="flex items-center gap-1.5 text-xs text-[#c9a84c] hover:underline mb-4 group"
            >
              <svg className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                <p className="text-xs text-[#c9a84c] font-semibold">{addDurationLabel(selectedTime, link.duration)}</p>
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
                  autoComplete="name"
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
                  autoComplete="email"
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
                  autoComplete="tel"
                  className="w-full rounded-lg border border-[#1a1a1a] bg-[#111] px-4 py-3 text-sm text-white placeholder:text-[#444] focus:border-[#c9a84c] focus:outline-none focus:ring-1 focus:ring-[#c9a84c]/30 transition-colors"
                  placeholder="+34 600 000 000"
                />
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 animate-in">
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

              <p className="text-[0.65rem] text-[#444] text-center">
                Al confirmar, recibiras un email con los detalles de tu reserva.
              </p>
            </form>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === "success" && selectedDate && selectedTime && (
          <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-8 text-center animate-in">
            {/* Animated checkmark */}
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6 animate-bounce-once">
              <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Reserva confirmada!</h2>
            <p className="text-sm text-[#888] mb-6">
              Hemos enviado un email de confirmacion a{" "}
              <strong className="text-white">{email}</strong>
            </p>

            <div className="inline-flex flex-col items-center gap-1 p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <p className="text-sm font-medium text-white capitalize">
                {DAY_NAMES[selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
              </p>
              <p className="text-lg font-bold text-[#c9a84c]">{addDurationLabel(selectedTime, link.duration)}</p>
              <p className="text-xs text-[#666]">{link.title}</p>
            </div>

            <p className="text-xs text-[#555] mt-6">
              Si necesitas cambiar tu cita, responde al email de confirmacion.
            </p>
          </div>
        )}
      </div>

      {/* Inline animations */}
      <style>{`
        .animate-in {
          animation: fadeSlideUp 0.3s ease-out;
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-bounce-once {
          animation: bounceOnce 0.5s ease-out;
        }
        @keyframes bounceOnce {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
