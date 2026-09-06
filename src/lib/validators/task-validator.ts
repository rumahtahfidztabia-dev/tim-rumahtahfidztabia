import { z } from "zod";
import { Team } from "../../generated/prisma/client";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  team: z.nativeEnum(Team),
  opsTaskCategoryId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  month: z.string().optional().nullable(),
  driveLink: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  contentCalendarItemId: z.string().optional().nullable(),
  brief: z.string().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const editTaskSchema = createTaskSchema.extend({
  id: z.string(),
});

export type EditTaskInput = z.infer<typeof editTaskSchema>;
