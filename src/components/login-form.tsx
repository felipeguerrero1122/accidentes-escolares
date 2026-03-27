"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "No fue posible iniciar sesión.");
      setPending(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-md p-8">
      <h1 className="text-3xl font-semibold text-pink-900">Ingreso</h1>
      <p className="mt-2 text-sm italic text-pink-600">Accede al registro de accidentes escolares.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-pink-800">Email</label>
          <input name="email" type="email" required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-pink-800">Contraseña</label>
          <input name="password" type="password" required />
        </div>
      </div>

      {error ? <p className="error-box mt-4 rounded-2xl px-4 py-3 text-sm">{error}</p> : null}

      <button type="submit" disabled={pending} className="primary-btn mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-60">
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
