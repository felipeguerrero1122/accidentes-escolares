import { ReactNode } from "react";

export function TableCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b border-pink-100 px-6 py-4">
        <h2 className="border-l-4 border-pink-400 pl-4 text-lg font-semibold text-pink-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}
