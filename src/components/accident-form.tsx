"use client";

import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, LayoutPanelTop, Settings, User } from "lucide-react";

type StudentPreview = {
  id: string;
  studentCode: string;
  fullName: string;
  rut: string;
  gradeLevel: string;
  birthDate: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
};

type CatalogOption = { id: string; name: string };

function ageAtDate(birthDate?: string | null, accidentDate?: string) {
  if (!birthDate || !accidentDate) return "";
  const birth = new Date(birthDate);
  const target = new Date(accidentDate);
  let age = target.getFullYear() - birth.getFullYear();
  const monthDiff = target.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && target.getDate() < birth.getDate())) age -= 1;
  return String(age);
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : "No registrado";
}

function AccentCard({
  icon,
  iconClassName,
  title,
  children
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="card-custom p-6">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}>{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-pink-900">{title}</h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">{label}</p>
      <p className="mt-1 text-sm text-pink-900">{displayValue(value)}</p>
    </div>
  );
}

export function AccidentForm({
  places,
  injuries
}: {
  places: CatalogOption[];
  injuries: CatalogOption[];
}) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentPreview | null>(null);
  const [rut, setRut] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [accidentDate, setAccidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [referred, setReferred] = useState(false);
  const [guardianInformed, setGuardianInformed] = useState(false);

  async function searchStudent(nextRut: string) {
    if (!nextRut.trim()) {
      setStudent(null);
      return;
    }

    const response = await fetch(`/api/students?rut=${encodeURIComponent(nextRut.trim())}`);
    if (!response.ok) {
      setStudent(null);
      return;
    }

    const data = (await response.json()) as StudentPreview[];
    setStudent(data[0] ?? null);
  }

  useEffect(() => {
    if (rut) {
      const timer = setTimeout(() => void searchStudent(rut), 250);
      return () => clearTimeout(timer);
    }
    setStudent(null);
  }, [rut]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student) {
      setError("Debes seleccionar un alumno válido por RUT.");
      return;
    }

    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/accidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: student.id,
        accidentDate: form.get("accidentDate"),
        accidentTime: form.get("accidentTime"),
        place: form.get("place"),
        description: form.get("description"),
        injuryType: form.get("injuryType") || null,
        firstAid: form.get("firstAid") || null,
        referred: form.get("referred") === "on",
        healthCenter: form.get("healthCenter") || null,
        guardianInformed: form.get("guardianInformed") === "on",
        guardianNoticeTime: form.get("guardianNoticeTime") || null,
        responsibleName: form.get("responsibleName") || null,
        observations: form.get("observations") || null
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "No fue posible guardar el accidente.");
      setPending(false);
      return;
    }

    const accident = await response.json();
    router.push(`/accidents/${accident.id}`);
    router.refresh();
  }

  return (
    <div className="rounded-[2rem] bg-[#FFF5F7] p-4 text-[#4A2C32] shadow-card md:p-8" style={{ fontFamily: 'Georgia, \"Times New Roman\", serif' }}>
      <style jsx>{`
        .card-custom {
          border-radius: 1.5rem;
          border: 1px solid white;
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        .card-custom:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .field-control {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #fbcfe8;
          background-color: white;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
          color: #4a2c32;
        }
        .field-control:focus {
          border-color: #f472b6;
          box-shadow: 0 0 0 2px #fce7f3;
        }
      `}</style>

      <div className="mx-auto max-w-5xl space-y-8">
        <header className="mb-12 flex items-center justify-between border-b border-pink-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-pink-900">Estilo Rosado &amp; Blanco</h1>
            <p className="mt-2 italic text-pink-600">Version HTML Autonoma</p>
          </div>
          <div className="flex gap-4">
            <button type="button" className="rounded-full p-2 shadow-sm transition hover:bg-white">
              <Bell className="h-5 w-5 text-pink-500" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-pink-200 bg-white shadow-sm">
              <User className="h-6 w-6 text-pink-400" />
            </div>
          </div>
        </header>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <section className="space-y-6 md:col-span-1">
              <div className="rounded-[1.5rem] border border-pink-100 bg-white/60 p-6 backdrop-blur-sm">
                <h2 className="mb-6 border-l-4 border-pink-400 pl-4 text-xl font-semibold text-pink-900">Formulario</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">RUT</label>
                    <input className="field-control" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="Ej: 27395492-9" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Fecha</label>
                    <input className="field-control" name="accidentDate" type="date" value={accidentDate} onChange={(e) => setAccidentDate(e.target.value)} required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Hora</label>
                    <input className="field-control" name="accidentTime" type="time" required defaultValue={new Date().toTimeString().slice(0, 5)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Lugar</label>
                    <select className="field-control" name="place" required defaultValue="">
                      <option value="" disabled>Selecciona un lugar</option>
                      {places.map((place) => <option key={place.id} value={place.name}>{place.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 md:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <AccentCard icon={<LayoutPanelTop className="h-6 w-6 text-pink-500" />} iconClassName="bg-pink-100" title="Minimalismo">
                  <p className="mb-4 text-sm leading-relaxed text-pink-700">
                    El blanco puro sobre el fondo rosado sutil crea un contraste limpio y moderno para registrar cada accidente.
                  </p>
                  <div className="grid gap-4">
                    <SummaryRow label="ID alumno" value={student?.studentCode} />
                    <SummaryRow label="Nombre" value={student?.fullName} />
                    <SummaryRow label="Curso / Nivel" value={student?.gradeLevel} />
                    <SummaryRow label="Edad" value={ageAtDate(student?.birthDate, accidentDate)} />
                  </div>
                </AccentCard>

                <AccentCard icon={<Settings className="h-6 w-6 text-pink-400" />} iconClassName="bg-pink-50" title="Personalizacion">
                  <p className="mb-4 text-sm leading-relaxed text-pink-700">
                    Las sombras son mas suaves para mantener la estetica delicada del diseno, sin perder informacion operativa.
                  </p>
                  <div className="grid gap-4">
                    <SummaryRow label="Apoderado" value={student?.guardianName} />
                    <SummaryRow label="Telefono" value={student?.guardianPhone} />
                    <SummaryRow label="Lesion" value={undefined} />
                    <SummaryRow label="Estado" value={student ? "Alumno encontrado" : "Esperando RUT"} />
                  </div>
                </AccentCard>
              </div>

              <div className="relative overflow-hidden rounded-[1.5rem] border border-pink-200 bg-gradient-to-br from-pink-400 to-pink-500 p-8 text-white shadow-lg">
                <div className="relative z-10">
                  <h3 className="mb-2 text-2xl font-bold italic">Refinamiento Visual</h3>
                  <p className="max-w-md text-pink-50 opacity-90">
                    "La combinacion de tonos rosados con tipografia clasica transmite calma y sofisticacion."
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-20"><Heart className="h-32 w-32" /></div>
              </div>

              <div className="card-custom p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Tipo de lesion</label>
                    <select className="field-control" name="injuryType" defaultValue="">
                      <option value="">Sin especificar</option>
                      {injuries.map((injury) => <option key={injury.id} value={injury.name}>{injury.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Responsable</label>
                    <input className="field-control" name="responsibleName" placeholder="Nombre de quien registra" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-pink-800">Descripcion</label>
                    <textarea className="field-control" name="description" rows={4} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-pink-800">Primeros auxilios</label>
                    <textarea className="field-control" name="firstAid" rows={3} />
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm font-medium text-pink-800">
                    <input type="checkbox" name="referred" className="h-4 w-4 accent-pink-500" checked={referred} onChange={(e) => setReferred(e.target.checked)} />
                    Requirio derivacion
                  </label>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Centro de salud</label>
                    <input className="field-control" name="healthCenter" disabled={!referred} />
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-pink-100 bg-white px-4 py-3 text-sm font-medium text-pink-800">
                    <input type="checkbox" name="guardianInformed" className="h-4 w-4 accent-pink-500" checked={guardianInformed} onChange={(e) => setGuardianInformed(e.target.checked)} />
                    Apoderado informado
                  </label>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-pink-800">Hora aviso apoderado</label>
                    <input className="field-control" name="guardianNoticeTime" type="time" disabled={!guardianInformed} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-pink-800">Observaciones</label>
                    <textarea className="field-control" name="observations" rows={3} />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={pending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-500 py-3 font-medium text-white shadow-md transition hover:bg-pink-600 active:scale-95 disabled:opacity-60"
                    >
                      <Heart className="h-4 w-4" />
                      {pending ? "Guardando..." : "Guardar accidente"}
                    </button>
                  </div>
                </div>
              </div>

              {error ? <div className="rounded-[1.5rem] border border-pink-200 bg-white/80 p-4 text-sm text-red-600">{error}</div> : null}
            </section>
          </div>
        </form>

        <footer className="pt-12 text-center text-sm italic text-pink-400">Diseno optimizado en tonos Rosado Claro y Blanco</footer>
      </div>
    </div>
  );
}
