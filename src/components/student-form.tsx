"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type StudentFormValues = {
  id?: string;
  studentCode?: string;
  fullName?: string;
  rut?: string;
  gradeLevel?: string;
  birthDate?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  healthNotes?: string | null;
  observations?: string | null;
  active?: boolean;
};

export function StudentForm({ initialValues }: { initialValues?: StudentFormValues }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      studentCode: form.get("studentCode"),
      fullName: form.get("fullName"),
      rut: form.get("rut"),
      gradeLevel: form.get("gradeLevel"),
      birthDate: form.get("birthDate") || null,
      guardianName: form.get("guardianName") || null,
      guardianPhone: form.get("guardianPhone") || null,
      healthNotes: form.get("healthNotes") || null,
      observations: form.get("observations") || null,
      active: form.get("active") === "on"
    };

    const response = await fetch(initialValues?.id ? `/api/students/${initialValues.id}` : "/api/students", {
      method: initialValues?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar el alumno.");
      setPending(false);
      return;
    }

    router.push("/students");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <div className="space-y-6">
        <section>
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-900">Datos del alumno</h3>
            <p className="mt-1 text-sm text-pink-700">Actualiza los datos identificatorios del estudiante.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">ID Alumno</label>
              <input name="studentCode" defaultValue={initialValues?.studentCode} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">RUT</label>
              <input name="rut" defaultValue={initialValues?.rut} required />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Nombre completo</label>
              <input name="fullName" defaultValue={initialValues?.fullName} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Curso / Nivel</label>
              <input name="gradeLevel" defaultValue={initialValues?.gradeLevel} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Fecha de nacimiento</label>
              <input name="birthDate" type="date" defaultValue={initialValues?.birthDate ?? ""} />
            </div>
          </div>
        </section>

        <section className="border-t border-pink-100 pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-900">Informacion del apoderado</h3>
            <p className="mt-1 text-sm text-pink-700">Datos de contacto usados en el formulario de accidentes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Apoderado</label>
              <input name="guardianName" defaultValue={initialValues?.guardianName ?? ""} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Telefono</label>
              <input name="guardianPhone" defaultValue={initialValues?.guardianPhone ?? ""} />
            </div>
          </div>
        </section>

        <section className="border-t border-pink-100 pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-pink-900">Salud y observaciones</h3>
            <p className="mt-1 text-sm text-pink-700">
              Antecedentes relevantes para la atencion y comentarios internos del alumno.
            </p>
          </div>
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Salud / Alergias</label>
              <textarea name="healthNotes" rows={4} defaultValue={initialValues?.healthNotes ?? ""} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Observaciones</label>
              <textarea name="observations" rows={4} defaultValue={initialValues?.observations ?? ""} />
            </div>
          </div>
        </section>
      </div>

      <label className="mt-6 flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={initialValues?.active ?? true} className="h-4 w-4" />
        Alumno activo
      </label>

      {error ? <p className="error-box mt-4 rounded-2xl px-4 py-3 text-sm">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="primary-btn mt-6 rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar alumno"}
      </button>
    </form>
  );
}
