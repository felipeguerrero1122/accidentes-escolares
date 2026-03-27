"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CatalogOption = {
  id: string;
  name: string;
};

type Props = {
  accidentId: string;
  places: CatalogOption[];
  injuries: CatalogOption[];
  initialValues: {
    accidentDate: string;
    accidentTime: string;
    place: string;
    injuryType: string;
    firstAid: string;
    referred: boolean;
    healthCenter: string;
    guardianInformed: boolean;
    guardianNoticeTime: string;
    responsibleName: string;
    description: string;
    observations: string;
  };
};

export function AccidentEditForm({ accidentId, places, injuries, initialValues }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [referred, setReferred] = useState(initialValues.referred);
  const [guardianInformed, setGuardianInformed] = useState(initialValues.guardianInformed);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch(`/api/accidents/${accidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      setError(data?.error ?? "No se pudo actualizar el accidente.");
      setPending(false);
      return;
    }

    router.refresh();
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Edición</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Actualizar accidente</h2>
        <p className="mt-2 text-sm text-slate-600">Modifica los datos del registro sin alterar la ficha congelada del alumno.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Fecha</label>
          <input name="accidentDate" type="date" defaultValue={initialValues.accidentDate} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Hora</label>
          <input name="accidentTime" type="time" defaultValue={initialValues.accidentTime} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Lugar</label>
          <select name="place" defaultValue={initialValues.place} required>
            <option value="" disabled>
              Selecciona un lugar
            </option>
            {places.map((place) => (
              <option key={place.id} value={place.name}>
                {place.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de lesión</label>
          <select name="injuryType" defaultValue={initialValues.injuryType}>
            <option value="">Sin especificar</option>
            {injuries.map((injury) => (
              <option key={injury.id} value={injury.name}>
                {injury.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
          <textarea name="description" rows={4} defaultValue={initialValues.description} required />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Primeros auxilios</label>
          <textarea name="firstAid" rows={3} defaultValue={initialValues.firstAid} />
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input type="checkbox" name="referred" className="h-4 w-4 accent-pink-500" defaultChecked={initialValues.referred} onChange={(event) => setReferred(event.target.checked)} />
          Requirió derivación
        </label>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Centro de salud</label>
          <input name="healthCenter" defaultValue={initialValues.healthCenter} disabled={!referred} />
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="guardianInformed"
            className="h-4 w-4 accent-pink-500"
            defaultChecked={initialValues.guardianInformed}
            onChange={(event) => setGuardianInformed(event.target.checked)}
          />
          Apoderado informado
        </label>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Hora aviso apoderado</label>
          <input name="guardianNoticeTime" type="time" defaultValue={initialValues.guardianNoticeTime} disabled={!guardianInformed} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Responsable</label>
          <input name="responsibleName" defaultValue={initialValues.responsibleName} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea name="observations" rows={3} defaultValue={initialValues.observations} />
        </div>
      </div>

      {error ? <p className="error-box rounded-2xl px-4 py-3 text-sm">{error}</p> : null}

      <button type="submit" disabled={pending} className="secondary-btn rounded-2xl px-4 py-3 text-sm font-semibold">
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
