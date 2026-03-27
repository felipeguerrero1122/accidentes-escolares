"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string };

function CatalogForm({ endpoint, title }: { endpoint: string; title: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    setError("");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "No se pudo agregar.");
      setPending(false);
      return;
    }

    setValue("");
    setPending(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <h3 className="text-lg font-semibold text-pink-900">{title}</h3>
      <div className="mt-4 flex gap-3">
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <button type="submit" disabled={pending} className="primary-btn rounded-2xl px-4 py-2 text-sm font-semibold">
          Agregar
        </button>
      </div>
      {error ? <p className="error-box mt-4 rounded-2xl px-4 py-3 text-sm">{error}</p> : null}
    </form>
  );
}

function ImportForm({ endpoint, title }: { endpoint: string; title: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(endpoint, { method: "POST", body: form });
    const data = await response.json();
    setMessage(`Importados: ${data.imported ?? 0}. Observaciones: ${data.issues?.length ?? 0}.`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <h3 className="text-lg font-semibold text-pink-900">{title}</h3>
      <input name="file" type="file" className="mt-4" accept=".xlsx,.xlsm,.csv" required />
      <button type="submit" className="secondary-btn mt-4 rounded-2xl px-4 py-2 text-sm font-semibold">
        Importar
      </button>
      {message ? <p className="mt-3 text-sm text-pink-700">{message}</p> : null}
    </form>
  );
}

function CatalogList({
  title,
  items,
  endpoint
}: {
  title: string;
  items: Item[];
  endpoint: string;
}) {
  const router = useRouter();
  const [rowPendingId, setRowPendingId] = useState("");
  const [rowError, setRowError] = useState("");

  async function updateItem(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setRowPendingId(id);
    setRowError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch(`${endpoint}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name") })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setRowError(data?.error ?? "No se pudo actualizar.");
      setRowPendingId("");
      return;
    }

    setRowPendingId("");
    router.refresh();
  }

  async function deleteItem(item: Item) {
    if (!window.confirm(`Vas a eliminar "${item.name}". Esta acción no se puede deshacer.`)) return;

    setRowPendingId(item.id);
    setRowError("");
    const response = await fetch(`${endpoint}/${item.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setRowError(data?.error ?? "No se pudo eliminar.");
      setRowPendingId("");
      return;
    }

    setRowPendingId("");
    router.refresh();
  }

  return (
    <section className="card p-6">
      <h3 className="text-lg font-semibold text-pink-900">{title}</h3>
      {rowError ? <p className="error-box mt-4 rounded-2xl px-4 py-3 text-sm">{rowError}</p> : null}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <form key={item.id} onSubmit={(event) => updateItem(event, item.id)} className="flex flex-wrap items-center gap-3 rounded-2xl border border-pink-100 bg-white/70 p-3">
            <input name="name" defaultValue={item.name} className="min-w-[220px] flex-1" disabled={rowPendingId === item.id} required />
            <button type="submit" disabled={rowPendingId === item.id} className="secondary-btn rounded-2xl px-4 py-2 text-sm font-semibold">
              {rowPendingId === item.id ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              disabled={rowPendingId === item.id}
              onClick={() => deleteItem(item)}
              className="rounded-2xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              Eliminar
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}

export function CatalogsAdmin({ places, injuries }: { places: Item[]; injuries: Item[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogForm endpoint="/api/catalogs/places" title="Agregar lugar" />
        <CatalogForm endpoint="/api/catalogs/injuries" title="Agregar tipo de lesión" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ImportForm endpoint="/api/students/import" title="Importar alumnos" />
        <ImportForm endpoint="/api/accidents/import" title="Importar accidentes" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CatalogList title="Lugares" items={places} endpoint="/api/catalogs/places" />
        <CatalogList title="Tipos de lesión" items={injuries} endpoint="/api/catalogs/injuries" />
      </div>
    </div>
  );
}
