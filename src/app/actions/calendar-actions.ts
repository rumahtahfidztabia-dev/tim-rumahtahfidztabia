"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getCalendarTasks(startDate: Date, endDate: Date) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const isSuperadmin = user.role === "SUPERADMIN";

    const whereClause: any = {
      dueDate: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (!isSuperadmin) {
      whereClause.assignedToId = user.id;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        opsTaskCategory: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          }
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    return tasks;
  } catch (error) {
    console.error("Error fetching calendar tasks:", error);
    return [];
  }
}
