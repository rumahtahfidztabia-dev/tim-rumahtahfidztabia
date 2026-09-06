import { prisma } from "./prisma";

export async function getKpiProgress(team: "KONTEN" | "FUNDRAISING", period: "HARIAN" | "MINGGUAN" | "BULANAN", date: Date) {
  // Logic to calculate progress of KPI entries against KPI targets
  
  // 1. Get targets for the active period
  const metrics = await prisma.kpiMetric.findMany({
    where: {
      team,
      period,
      isActive: true,
    },
    include: {
      targets: {
        where: {
          periodStart: { lte: date },
          periodEnd: { gte: date }
        }
      },
      entries: {
        where: {
          entryDate: { lte: date }
          // Depending on period, we might need a range here
        }
      }
    }
  });

  return metrics.map(metric => {
    const target = metric.targets[0]?.targetValue || 0;
    const totalRealized = metric.entries.reduce((sum, entry) => sum + Number(entry.value), 0);
    
    return {
      metricId: metric.id,
      name: metric.name,
      unit: metric.unit,
      target: target ? Number(target) : 0,
      realized: totalRealized,
      progressPercentage: target && Number(target) > 0 ? (totalRealized / Number(target)) * 100 : 0
    };
  });
}
