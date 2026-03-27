-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'OPERATOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "rut" TEXT NOT NULL,
    "gradeLevel" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "guardianName" TEXT,
    "guardianPhone" TEXT,
    "healthNotes" TEXT,
    "observations" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accident" (
    "id" TEXT NOT NULL,
    "recordNumber" INTEGER NOT NULL,
    "studentId" TEXT NOT NULL,
    "accidentDate" TIMESTAMP(3) NOT NULL,
    "accidentTime" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "injuryType" TEXT,
    "firstAid" TEXT,
    "referred" BOOLEAN NOT NULL DEFAULT false,
    "healthCenter" TEXT,
    "guardianInformed" BOOLEAN NOT NULL DEFAULT false,
    "guardianNoticeTime" TEXT,
    "responsibleName" TEXT,
    "observations" TEXT,
    "studentRut" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "studentFullName" TEXT NOT NULL,
    "studentGradeLevel" TEXT NOT NULL,
    "studentAgeAtAccident" INTEGER,
    "guardianNameSnapshot" TEXT,
    "guardianPhoneSnapshot" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogPlace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogInjury" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogInjury_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_rut_key" ON "Student"("rut");

-- CreateIndex
CREATE INDEX "Student_gradeLevel_idx" ON "Student"("gradeLevel");

-- CreateIndex
CREATE INDEX "Student_fullName_idx" ON "Student"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "Accident_recordNumber_key" ON "Accident"("recordNumber");

-- CreateIndex
CREATE INDEX "Accident_studentId_idx" ON "Accident"("studentId");

-- CreateIndex
CREATE INDEX "Accident_accidentDate_idx" ON "Accident"("accidentDate");

-- CreateIndex
CREATE INDEX "Accident_studentGradeLevel_idx" ON "Accident"("studentGradeLevel");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogPlace_name_key" ON "CatalogPlace"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogInjury_name_key" ON "CatalogInjury"("name");

-- AddForeignKey
ALTER TABLE "Accident" ADD CONSTRAINT "Accident_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accident" ADD CONSTRAINT "Accident_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
