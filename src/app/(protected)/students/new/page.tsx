import { PageHeader } from "@/components/page-header";
import { StudentForm } from "@/components/student-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewStudentPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo alumno" description="Crea una ficha maestra para autocompletar futuros accidentes." />
      <StudentForm />
    </div>
  );
}
