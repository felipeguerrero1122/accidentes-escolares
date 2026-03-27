import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

type SummaryRow = {
  label: string;
  count: number;
};

type Props = {
  generatedAt: Date;
  establishmentName?: string | null;
  summary: {
    total: number;
    withReferral: number;
    withoutGuardianNotice: number;
    missingDescription: number;
    lastRecordNumber: number;
    topGrade: string;
    topInjury: string;
    topWeekdayLabel: string;
    topWeekdayCount: number;
    accidentsByGrade: SummaryRow[];
    accidentsByInjury: SummaryRow[];
    accidentsByDay: SummaryRow[];
  };
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 32,
    paddingBottom: 28,
    fontSize: 10,
    color: "#1f2937"
  },
  header: {
    marginBottom: 18,
    borderBottom: "1 solid #cbd5e1",
    paddingBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 4
  },
  subtitle: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 2
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 8
  },
  section: {
    marginBottom: 16
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  kpiCard: {
    width: "31%",
    minHeight: 62,
    border: "1 solid #dbe3ec",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8
  },
  kpiLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: 6
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111827"
  },
  multiColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  column: {
    width: "48%"
  },
  columnFull: {
    width: "100%"
  },
  table: {
    border: "1 solid #dbe3ec",
    borderRadius: 8,
    overflow: "hidden"
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0"
  },
  tableHeadCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 9,
    fontWeight: 700,
    color: "#0f172a"
  },
  tableRow: {
    flexDirection: "row",
    borderTop: "1 solid #e2e8f0"
  },
  tableCell: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    color: "#334155"
  },
  footer: {
    marginTop: 14,
    borderTop: "1 solid #e2e8f0",
    paddingTop: 10,
    fontSize: 9,
    color: "#64748b"
  }
});

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Santiago"
  }).format(value);
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{String(value)}</Text>
    </View>
  );
}

function SummaryTable({
  title,
  emptyLabel,
  rows,
  firstColumnLabel,
  fullWidth = false
}: {
  title: string;
  emptyLabel: string;
  rows: SummaryRow[];
  firstColumnLabel: string;
  fullWidth?: boolean;
}) {
  const safeRows = rows.length > 0 ? rows : [{ label: emptyLabel, count: 0 }];

  return (
    <View style={fullWidth ? styles.columnFull : styles.column}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHead}>
          <Text style={styles.tableHeadCell}>{firstColumnLabel}</Text>
          <Text style={styles.tableHeadCell}>Cantidad</Text>
        </View>
        {safeRows.map((row, index) => (
          <View key={`${row.label}-${index}`} style={styles.tableRow}>
            <Text style={styles.tableCell}>{row.label}</Text>
            <Text style={styles.tableCell}>{row.label === emptyLabel ? "-" : String(row.count)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function DashboardPdfDocument({ generatedAt, establishmentName, summary }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Resumen de accidentes escolares</Text>
          <Text style={styles.subtitle}>{establishmentName?.trim() || "Sistema de registro de accidentes escolares"}</Text>
          <Text style={styles.subtitle}>Generado: {formatDateTime(generatedAt)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicadores</Text>
          <View style={styles.kpiGrid}>
            <KpiCard label="Total accidentes" value={summary.total} />
            <KpiCard label="Con derivación" value={summary.withReferral} />
            <KpiCard label="Sin aviso apoderado" value={summary.withoutGuardianNotice} />
            <KpiCard label="Sin descripción" value={summary.missingDescription} />
            <KpiCard label="Último registro" value={summary.lastRecordNumber} />
            <KpiCard label="Curso con más accidentes" value={summary.topGrade || "-"} />
            <KpiCard label="Lesión más frecuente" value={summary.topInjury || "-"} />
            <KpiCard label="Día con más accidentes" value={summary.topWeekdayLabel || "-"} />
          </View>
        </View>

        <View style={[styles.section, styles.multiColumns]}>
          <SummaryTable
            title="Accidentes por curso"
            firstColumnLabel="Curso"
            emptyLabel="Sin registros"
            rows={summary.accidentsByGrade}
          />
          <SummaryTable
            title="Accidentes por tipo de lesión"
            firstColumnLabel="Lesión"
            emptyLabel="Sin registros"
            rows={summary.accidentsByInjury}
          />
        </View>

        <View style={styles.section}>
          <SummaryTable
            title="Accidentes por día"
            firstColumnLabel="Fecha"
            emptyLabel="Sin registros"
            rows={summary.accidentsByDay}
            fullWidth
          />
        </View>

        <Text style={styles.footer}>
          Documento generado automáticamente desde el dashboard institucional de accidentes escolares.
        </Text>
      </Page>
    </Document>
  );
}
