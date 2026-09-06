-- CreateEnum
CREATE TYPE "Team" AS ENUM ('KONTEN', 'FUNDRAISING');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('BRIEF', 'DALAM_PROSES', 'REVIEW', 'SELESAI');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('KONTEN_CAMPAIGN', 'KONTEN_KEGIATAN', 'FUNDRAISING_FOLLOWUP', 'LAINNYA');

-- CreateEnum
CREATE TYPE "ContentChannel" AS ENUM ('IG_FEED', 'IG_STORY', 'THREADS', 'FACEBOOK', 'WHATSAPP', 'WEBSITE');

-- CreateEnum
CREATE TYPE "KpiPeriod" AS ENUM ('HARIAN', 'MINGGUAN', 'BULANAN');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'CHECKBOX', 'USER');

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "team" "Team" NOT NULL,
    "type" "TaskType" NOT NULL DEFAULT 'LAINNYA',
    "status" "TaskStatus" NOT NULL DEFAULT 'BRIEF',
    "dueDate" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "contentCalendarItemId" TEXT,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentCalendarItem" (
    "id" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "channel" "ContentChannel" NOT NULL,
    "topic" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentCalendarItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiMetric" (
    "id" TEXT NOT NULL,
    "team" "Team" NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "period" "KpiPeriod" NOT NULL DEFAULT 'MINGGUAN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KpiMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiTarget" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "targetValue" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KpiEntry" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KpiEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WikiPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "team" "Team",
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WikiPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "team" "Team",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTableField" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL,
    "options" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomTableField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTableRow" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTableRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Task_team_status_idx" ON "Task"("team", "status");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_order_idx" ON "Task"("order");

-- CreateIndex
CREATE INDEX "ContentCalendarItem_scheduledDate_idx" ON "ContentCalendarItem"("scheduledDate");

-- CreateIndex
CREATE INDEX "KpiTarget_metricId_periodStart_idx" ON "KpiTarget"("metricId", "periodStart");

-- CreateIndex
CREATE INDEX "KpiEntry_metricId_entryDate_idx" ON "KpiEntry"("metricId", "entryDate");

-- CreateIndex
CREATE INDEX "KpiEntry_userId_entryDate_idx" ON "KpiEntry"("userId", "entryDate");

-- CreateIndex
CREATE UNIQUE INDEX "WikiPage_slug_key" ON "WikiPage"("slug");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_contentCalendarItemId_fkey" FOREIGN KEY ("contentCalendarItemId") REFERENCES "ContentCalendarItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiTarget" ADD CONSTRAINT "KpiTarget_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "KpiMetric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiEntry" ADD CONSTRAINT "KpiEntry_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "KpiMetric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KpiEntry" ADD CONSTRAINT "KpiEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WikiPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTableField" ADD CONSTRAINT "CustomTableField_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "CustomTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTableRow" ADD CONSTRAINT "CustomTableRow_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "CustomTable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

