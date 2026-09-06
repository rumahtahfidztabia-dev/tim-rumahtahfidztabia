"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Team, KpiPeriod } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

// Helper: parse month string YYYY-MM into date range
function getMonthRange(monthStr: string) {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

// ─── Superadmin: Monthly KPI for all staff & teams ───────────────────────────
export async function getMonthlyKpiData(monthStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const { start, end } = getMonthRange(monthStr);

  // Fetch all non-superadmin staff
  const staffUsers = await prisma.adminUser.findMany({
    where: { role: { not: "SUPERADMIN" }, isActive: true },
    select: { id: true, name: true, role: true },
  });

  // Team-level aggregates
  const kontenTotal = await prisma.task.count({
    where: { team: "KONTEN", month: monthStr },
  });
  const kontenCompleted = await prisma.task.count({
    where: { team: "KONTEN", month: monthStr, status: "SELESAI" },
  });
  const fundraisingTotal = await prisma.task.count({
    where: { team: "FUNDRAISING", month: monthStr },
  });
  const fundraisingCompleted = await prisma.task.count({
    where: { team: "FUNDRAISING", month: monthStr, status: "SELESAI" },
  });

  // Per-staff breakdown
  const staffData = await Promise.all(
    staffUsers.map(async (staff) => {
      const total = await prisma.task.count({
        where: { assignedToId: staff.id, month: monthStr },
      });
      const completed = await prisma.task.count({
        where: { assignedToId: staff.id, month: monthStr, status: "SELESAI" },
      });
      const incompleteTasks = await prisma.task.findMany({
        where: {
          assignedToId: staff.id,
          month: monthStr,
          status: { not: "SELESAI" },
        },
        select: {
          id: true,
          title: true,
          dueDate: true,
          status: true,
          kpiNote: true,
        },
      });

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        team: staff.role === "EDITOR" ? "KONTEN" : "FUNDRAISING",
        total,
        completed,
        incomplete: total - completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        incompleteTasks,
      };
    })
  );

  // KPI Manual metrics (from DB)
  const manualMetrics = await prisma.kpiMetric.findMany({
    where: { isActive: true },
    include: {
      targets: { orderBy: { periodStart: "desc" }, take: 1 },
      entries: {
        where: { entryDate: { gte: start, lte: end } },
        orderBy: { entryDate: "desc" },
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    month: monthStr,
    team: {
      konten: { total: kontenTotal, completed: kontenCompleted, percentage: kontenTotal > 0 ? Math.round((kontenCompleted / kontenTotal) * 100) : 0 },
      fundraising: { total: fundraisingTotal, completed: fundraisingCompleted, percentage: fundraisingTotal > 0 ? Math.round((fundraisingCompleted / fundraisingTotal) * 100) : 0 },
    },
    staff: staffData,
    manualMetrics,
  };
}

// ─── Staff: Personal monthly KPI ─────────────────────────────────────────────
export async function getPersonalMonthlyKpi(monthStr: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as { id: string }).id;
  const { start, end } = getMonthRange(monthStr);

  const total = await prisma.task.count({
    where: { assignedToId: userId, month: monthStr },
  });
  const completed = await prisma.task.count({
    where: { assignedToId: userId, month: monthStr, status: "SELESAI" },
  });
  const incompleteTasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      month: monthStr,
      status: { not: "SELESAI" },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      kpiNote: true,
    },
  });

  // Trend: last 5 months
  const trend = await Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { month: m };
    }).map(async ({ month }) => {
      const t = await prisma.task.count({ where: { assignedToId: userId, month } });
      const c = await prisma.task.count({ where: { assignedToId: userId, month, status: "SELESAI" } });
      return { month, total: t, completed: c, percentage: t > 0 ? Math.round((c / t) * 100) : 0 };
    })
  );

  // void suppress unused warning
  void start; void end;

  return {
    month: monthStr,
    total,
    completed,
    incomplete: total - completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    incompleteTasks,
    trend: trend.reverse(),
  };
}

// ─── Superadmin: Add/update KPI note on a task ───────────────────────────────
export async function addKpiNote(taskId: string, note: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { kpiNote: note },
  });

  revalidatePath("/kpi");
}

// ─── Legacy: still used by ManageMetricModal ─────────────────────────────────
export async function getKpiDashboardData(team?: Team) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const whereClause = team ? { team } : {};
  const metrics = await prisma.kpiMetric.findMany({
    where: { isActive: true, ...whereClause },
    include: {
      targets: { orderBy: { periodStart: "desc" }, take: 1 },
      entries: {
        orderBy: { entryDate: "desc" },
        take: 10,
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return metrics;
}

export async function createKpiMetric(data: {
  team: Team;
  name: string;
  unit: string;
  period: KpiPeriod;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }
  const metric = await prisma.kpiMetric.create({ data });
  revalidatePath("/kpi");
  return metric;
}

export async function createMetricWithTarget(data: {
  team: Team;
  name: string;
  unit: string;
  period: KpiPeriod;
  initialTarget: number;
  periodStart: Date;
  periodEnd: Date;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }
  const metric = await prisma.kpiMetric.create({
    data: {
      team: data.team,
      name: data.name,
      unit: data.unit,
      period: data.period,
      targets: {
        create: {
          periodStart: new Date(data.periodStart),
          periodEnd: new Date(data.periodEnd),
          targetValue: data.initialTarget,
        },
      },
    },
  });
  revalidatePath("/kpi");
  return metric;
}

export async function setKpiTarget(data: {
  metricId: string;
  periodStart: Date;
  periodEnd: Date;
  targetValue: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as { role: string }).role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }
  const target = await prisma.kpiTarget.create({
    data: {
      metricId: data.metricId,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      targetValue: data.targetValue,
    },
  });
  revalidatePath("/kpi");
  return target;
}

export async function logKpiEntry(data: {
  metricId: string;
  entryDate: Date;
  value: number;
  note?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as { id: string }).id;
  const entry = await prisma.kpiEntry.create({
    data: {
      metricId: data.metricId,
      userId,
      entryDate: new Date(data.entryDate),
      value: data.value,
      note: data.note,
    },
  });
  revalidatePath("/kpi");
  return entry;
}
