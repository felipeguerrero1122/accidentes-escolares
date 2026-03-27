"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ErrorResponse = { error?: string };

export function DeleteAccidentButton({ accidentId }: { accidentId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm("¿Seguro que quieres eliminar este accidente? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setPending(true);
    setError("");

    const response = await fetch(`/api/accidents/${accidentId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ErrorResponse | null;
      setError(data?.error ?? "No fue posible eliminar el accidente.");
      setPending(false);
      return;
    }

    router.push("/accidents");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
      >
        {pending ? "Eliminando..." : "Eliminar accidente"}
      </button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
