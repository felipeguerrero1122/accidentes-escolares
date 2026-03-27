"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OPERATOR";
  active: boolean;
};

type ErrorResponse = { error?: string };

function UserRow({
  user,
  onUpdated,
  onDeleted
}: {
  user: UserItem;
  onUpdated: () => void;
  onDeleted: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserItem["role"]>(user.role);
  const [active, setActive] = useState(user.active ? "true" : "false");
  const [password, setPassword] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const response = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        active: active === "true"
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ErrorResponse | null;
      setError(data?.error ?? "No se pudo actualizar el usuario.");
      setPending(false);
      return;
    }

    setPassword("");
    setPending(false);
    onUpdated();
  }

  async function handleDelete() {
    if (!window.confirm(`Vas a eliminar a ${user.name}. Esta acción no se puede deshacer.`)) return;

    setPending(true);
    setError("");
    const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ErrorResponse | null;
      setError(data?.error ?? "No se pudo eliminar el usuario.");
      setPending(false);
      return;
    }

    setPending(false);
    onDeleted();
  }

  return (
    <>
      <tr className="table-row align-top">
        <td className="px-4 py-3">
          <form onSubmit={onSubmit}>
            <input value={name} onChange={(event) => setName(event.target.value)} className="min-w-[180px]" disabled={pending} required />
          </form>
        </td>
        <td className="px-4 py-3">
          <form onSubmit={onSubmit}>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="min-w-[220px]" disabled={pending} required />
          </form>
        </td>
        <td className="px-4 py-3">
          <form onSubmit={onSubmit}>
            <select value={role} onChange={(event) => setRole(event.target.value as UserItem["role"])} disabled={pending}>
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </form>
        </td>
        <td className="px-4 py-3">
          <form onSubmit={onSubmit}>
            <select value={active} onChange={(event) => setActive(event.target.value)} disabled={pending}>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </form>
        </td>
        <td className="px-4 py-3">
          <form onSubmit={onSubmit}>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Opcional"
              className="min-w-[170px]"
              disabled={pending}
            />
          </form>
        </td>
        <td className="px-4 py-3">
          <form onSubmit={onSubmit} className="flex min-w-[200px] gap-2">
            <button type="submit" disabled={pending} className="secondary-btn rounded-2xl px-3 py-2 text-xs font-semibold">
              {pending ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="rounded-2xl border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              Eliminar
            </button>
          </form>
        </td>
      </tr>
      {error ? (
        <tr>
          <td colSpan={6} className="px-4 pb-3">
            <p className="error-box rounded-2xl px-4 py-3 text-sm">{error}</p>
          </td>
        </tr>
      ) : null}
    </>
  );
}

export function UsersAdmin({ users }: { users: UserItem[] }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role")
      })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ErrorResponse | null;
      setError(data?.error ?? "No se pudo crear el usuario.");
      setPending(false);
      return;
    }

    router.refresh();
    event.currentTarget.reset();
    setPending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form onSubmit={onSubmit} className="card p-6">
        <h3 className="text-lg font-semibold text-pink-900">Crear usuario</h3>
        <div className="mt-4 space-y-4">
          <input name="name" placeholder="Nombre" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Contraseña" required />
          <select name="role" defaultValue="OPERATOR">
            <option value="OPERATOR">Operador</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        {error ? <p className="error-box mt-4 rounded-2xl px-4 py-3 text-sm">{error}</p> : null}
        <button type="submit" disabled={pending} className="primary-btn mt-4 rounded-2xl px-4 py-2 text-sm font-semibold">
          {pending ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      <section className="card p-6">
        <h3 className="text-lg font-semibold text-pink-900">Usuarios</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="table-head text-left">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3">Nueva contraseña</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow key={user.id} user={user} onUpdated={() => router.refresh()} onDeleted={() => router.refresh()} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
