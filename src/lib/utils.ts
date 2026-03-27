export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function normalizeRut(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function normalizePhone(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits || value.trim();
}

export function parseBooleanYesNo(value?: string | null) {
  if (!value) return false;
  return ["si", "sí", "true", "1", "yes"].includes(value.trim().toLowerCase());
}

export function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CL").format(date);
}

export function calculateAgeAtDate(birthDate?: Date | null, targetDate?: Date | null) {
  if (!birthDate || !targetDate) return null;
  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = targetDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function coerceDate(input: Date | string | number | null | undefined) {
  if (!input && input !== 0) return null;
  if (input instanceof Date) return input;
  if (typeof input === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(excelEpoch.getTime() + input * 86400000);
    return Number.isNaN(result.getTime()) ? null : result;
  }
  const result = new Date(input);
  return Number.isNaN(result.getTime()) ? null : result;
}

export function cleanText(value?: FormDataEntryValue | string | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\uFFFD/g, "").trim();
  return trimmed || null;
}

export function sanitizeTextForDb(value?: string | null) {
  if (value == null) return value ?? null;
  const sanitized = value.replace(/\uFFFD/g, "").trim();
  return sanitized || null;
}

export function sanitizeObjectStrings<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObjectStrings(item)) as T;
  }

  if (input instanceof Date || Object.prototype.toString.call(input) === "[object Date]") {
    return input;
  }

  if (input && typeof input === "object") {
    const entries = Object.entries(input as Record<string, unknown>).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, sanitizeTextForDb(value)];
      }
      return [key, sanitizeObjectStrings(value)];
    });

    return Object.fromEntries(entries) as T;
  }

  return input;
}

export function composeFullName(parts: {
  givenNames?: string | null;
  paternalSurname?: string | null;
  maternalSurname?: string | null;
  fallback?: string | null;
}) {
  const assembled = [parts.givenNames, parts.paternalSurname, parts.maternalSurname]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");

  if (assembled) return assembled;
  return parts.fallback?.trim() || "";
}

export function splitFullName(fullName?: string | null) {
  const tokens = (fullName ?? "")
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (tokens.length >= 3) {
    return {
      givenNames: tokens.slice(0, -2).join(" "),
      paternalSurname: tokens.at(-2) ?? "",
      maternalSurname: tokens.at(-1) ?? ""
    };
  }

  if (tokens.length === 2) {
    return {
      givenNames: tokens[0],
      paternalSurname: tokens[1],
      maternalSurname: ""
    };
  }

  return {
    givenNames: tokens[0] ?? "",
    paternalSurname: "",
    maternalSurname: ""
  };
}
