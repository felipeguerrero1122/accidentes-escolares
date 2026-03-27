import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Accident, Student } from "@prisma/client";
import { formatDate } from "@/lib/utils";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#183b56" },
  title: { fontSize: 18, marginBottom: 16, fontWeight: 700 },
  section: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6, gap: 12 },
  block: { border: "1 solid #dbe3ec", borderRadius: 8, padding: 12 }
});

type Props = {
  accident: Accident;
  student: Student;
};

export function AccidentPdfDocument({ accident }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Ficha Individual de Accidente Escolar</Text>

        <View style={[styles.section, styles.block]}>
          <View style={styles.row}>
            <Text>N° Registro: {accident.recordNumber}</Text>
            <Text>Fecha: {formatDate(accident.accidentDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Hora: {accident.accidentTime}</Text>
            <Text>RUT: {accident.studentRut}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.block]}>
          <Text>Alumno: {accident.studentFullName}</Text>
          <Text>ID Alumno: {accident.studentCode}</Text>
          <Text>Curso / Nivel: {accident.studentGradeLevel}</Text>
          <Text>Edad: {accident.studentAgeAtAccident ?? "-"}</Text>
          <Text>Apoderado: {accident.guardianNameSnapshot ?? "-"}</Text>
          <Text>Teléfono: {accident.guardianPhoneSnapshot ?? "-"}</Text>
        </View>

        <View style={[styles.section, styles.block]}>
          <Text>Lugar del accidente: {accident.place}</Text>
          <Text>Tipo de lesión: {accident.injuryType ?? "-"}</Text>
          <Text>Descripción: {accident.description}</Text>
          <Text>Primeros auxilios: {accident.firstAid ?? "-"}</Text>
          <Text>Derivación: {accident.referred ? "Sí" : "No"}</Text>
          <Text>Centro de salud: {accident.healthCenter ?? "-"}</Text>
          <Text>Apoderado informado: {accident.guardianInformed ? "Sí" : "No"}</Text>
          <Text>Hora aviso apoderado: {accident.guardianNoticeTime ?? "-"}</Text>
          <Text>Responsable: {accident.responsibleName ?? "-"}</Text>
          <Text>Observaciones: {accident.observations ?? "-"}</Text>
        </View>
      </Page>
    </Document>
  );
}
