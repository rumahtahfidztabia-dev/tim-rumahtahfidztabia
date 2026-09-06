"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateTaskInput, EditTaskInput, createTaskSchema, editTaskSchema } from "@/lib/validators/task-validator";
import { TaskStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export async function getTasks(team?: "KONTEN" | "FUNDRAISING") {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const tasks = await prisma.task.findMany({
    where: {
      team: team,
    },
    include: {
      assignedTo: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return tasks;
}

export async function updateTaskStatusAndOrder(
  updates: { id: string; status: TaskStatus; order: number }[]
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Use a transaction to perform all updates atomically
  await prisma.$transaction(
    updates.map((update) =>
      prisma.task.update({
        where: { id: update.id },
        data: {
          status: update.status,
          order: update.order,
          completedAt: update.status === "SELESAI" ? new Date() : null,
        },
      })
    )
  );

  revalidatePath("/", "layout");
}

export async function createTask(input: CreateTaskInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validatedData = createTaskSchema.parse(input);

  // Find the highest order in the BRIEF column for this team
  const lastTask = await prisma.task.findFirst({
    where: {
      team: validatedData.team,
      status: "BRIEF",
    },
    orderBy: {
      order: "desc",
    },
    select: { order: true },
  });

  const nextOrder = lastTask ? lastTask.order + 1 : 0;

  const newTask = await prisma.task.create({
    data: {
      title: validatedData.title,
      description: validatedData.description,
      team: validatedData.team,
      opsTaskCategoryId: validatedData.opsTaskCategoryId || null,
      status: "BRIEF",
      order: nextOrder,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      month: validatedData.month || null,
      driveLink: validatedData.driveLink || null,
      assignedToId: validatedData.assignedToId,
      createdById: (session.user as { id: string }).id,
      contentCalendarItemId: validatedData.contentCalendarItemId || null,
      brief: validatedData.brief || null,
    },
  });

  revalidatePath("/", "layout");
  return newTask;
}

export async function getTeamMembers() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Fetch users that have access to ops. In a real app, you might filter by team if AdminUser has a team field.
  // For now, returning all active AdminUsers.
  const members = await prisma.adminUser.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    orderBy: { name: "asc" },
  });

  return members;
}

export async function updateTaskDetails(input: EditTaskInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const validatedData = editTaskSchema.parse(input);

  const updatedTask = await prisma.task.update({
    where: { id: validatedData.id },
    data: {
      title: validatedData.title,
      description: validatedData.description,
      team: validatedData.team,
      opsTaskCategoryId: validatedData.opsTaskCategoryId || null,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
      month: validatedData.month || null,
      driveLink: validatedData.driveLink || null,
      assignedToId: validatedData.assignedToId,
      contentCalendarItemId: validatedData.contentCalendarItemId || null,
      brief: validatedData.brief || null,
    },
  });

  revalidatePath("/", "layout");
  return updatedTask;
}

export async function deleteTask(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/", "layout");
}

export async function bulkImportTasks(tasksData: {
  title: string;
  description?: string;
  team: "KONTEN" | "FUNDRAISING";
  assigneeEmail?: string;
  dueDate?: string; // ISO string or null
}[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  
  // Find users by email to get their IDs
  const emails = tasksData.map(t => t.assigneeEmail).filter(Boolean) as string[];
  const users = await prisma.adminUser.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true }
  });
  const userMap = new Map(users.map(u => [u.email, u.id]));
  
  const createdById = (session.user as { id: string }).id;
  
  // Get max order for KONTEN and FUNDRAISING in BRIEF status
  const lastTaskKonten = await prisma.task.findFirst({ 
    where: { team: "KONTEN", status: "BRIEF" }, 
    orderBy: { order: "desc" }
  });
  const lastTaskFundraising = await prisma.task.findFirst({ 
    where: { team: "FUNDRAISING", status: "BRIEF" }, 
    orderBy: { order: "desc" }
  });
  
  let orderKonten = lastTaskKonten ? lastTaskKonten.order + 1 : 0;
  let orderFundraising = lastTaskFundraising ? lastTaskFundraising.order + 1 : 0;
  
  const insertData = tasksData.map(t => {
    let order = 0;
    if (t.team === "KONTEN") order = orderKonten++;
    if (t.team === "FUNDRAISING") order = orderFundraising++;
    
    const taskDate = t.dueDate ? new Date(t.dueDate) : new Date();
    const monthStr = taskDate.toISOString().slice(0, 7);

    return {
      title: t.title,
      description: t.description || null,
      team: t.team,
      status: "BRIEF" as TaskStatus,
      assignedToId: t.assigneeEmail ? userMap.get(t.assigneeEmail) || null : null,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
      month: monthStr,
      createdById,
      order
    };
  });
  
  await prisma.task.createMany({
    data: insertData
  });
  
  revalidatePath("/", "layout");
  return { success: true, count: insertData.length };
}
