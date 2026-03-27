import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const studentSchema = z.object({
  studentCode: z.string().min(1),
  fullName: z.string().min(2),
  paternalSurname: z.string().optional().nullable(),
  maternalSurname: z.string().optional().nullable(),
  givenNames: z.string().optional().nullable(),
  rut: z.string().min(6),
  gradeLevel: z.string().min(1),
  schoolSchedule: z.string().optional().nullable(),
  sex: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianPhone: z.string().optional().nullable(),
  phoneAreaCode: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  residenceStreet: z.string().optional().nullable(),
  residenceNumber: z.string().optional().nullable(),
  residenceNeighborhood: z.string().optional().nullable(),
  residenceCommune: z.string().optional().nullable(),
  residenceCity: z.string().optional().nullable(),
  healthNotes: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  active: z.boolean().default(true)
});

const accidentBaseSchema = z.object({
  studentId: z.string().min(1),
  accidentDate: z.string().min(1),
  accidentTime: z.string().min(1),
  place: z.string().min(1),
  description: z.string().min(1),
  injuryType: z.string().optional().nullable(),
  firstAid: z.string().optional().nullable(),
  referred: z.boolean().default(false),
  healthCenter: z.string().optional().nullable(),
  guardianInformed: z.boolean().default(false),
  guardianNoticeTime: z.string().optional().nullable(),
  responsibleName: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
  accidentContext: z.string().optional().nullable(),
  witnessAName: z.string().optional().nullable(),
  witnessAId: z.string().optional().nullable(),
  witnessBName: z.string().optional().nullable(),
  witnessBId: z.string().optional().nullable(),
  accidentCircumstances: z.string().optional().nullable(),
  medicalServiceCode: z.string().optional().nullable(),
  medicalEstablishmentCode: z.string().optional().nullable(),
  medicalEstablishmentName: z.string().optional().nullable(),
  medicalDiagnosis: z.string().optional().nullable(),
  affectedBodyPart: z.string().optional().nullable(),
  hospitalized: z.boolean().optional().nullable(),
  hospitalizationDays: z.coerce.number().int().optional().nullable(),
  hasIncapacity: z.boolean().optional().nullable(),
  incapacityDays: z.coerce.number().int().optional().nullable(),
  incapacityTypeCode: z.string().optional().nullable(),
  caseClosureCauseCode: z.string().optional().nullable(),
  caseClosureDate: z.string().optional().nullable()
});

function withAccidentRules<T extends z.AnyZodObject>(schema: T) {
  return schema.superRefine((value, ctx) => {
    if (value.referred && !value.healthCenter) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Centro de salud es obligatorio si hubo derivación.",
        path: ["healthCenter"]
      });
    }

    if (value.guardianInformed && !value.guardianNoticeTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hora de aviso es obligatoria si se informó al apoderado.",
        path: ["guardianNoticeTime"]
      });
    }
  });
}

export const accidentSchema = withAccidentRules(accidentBaseSchema);
export const accidentPatchSchema = withAccidentRules(accidentBaseSchema.partial());

export const catalogSchema = z.object({
  name: z.string().min(2)
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "OPERATOR"])
});

export const userUpdateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["ADMIN", "OPERATOR"]),
  active: z.boolean()
});

export const schoolSettingsSchema = z.object({
  establishmentName: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  commune: z.string().optional().nullable(),
  dependencyType: z.string().optional().nullable()
});
