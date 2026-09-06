import { z } from "zod";

export const ContentChannelEnum = z.enum([
  "IG_FEED",
  "IG_STORY",
  "THREADS",
  "FACEBOOK",
  "WHATSAPP",
  "WEBSITE",
]);

export const CreateCalendarItemSchema = z.object({
  scheduledDate: z.string().min(1, "Tanggal harus diisi"),
  channel: ContentChannelEnum,
  topic: z.string().min(1, "Topik harus diisi"),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional(),
});

export type CreateCalendarInput = z.infer<typeof CreateCalendarItemSchema>;

export const UpdateCalendarItemSchema = CreateCalendarItemSchema.extend({
  id: z.string(),
});

export type UpdateCalendarInput = z.infer<typeof UpdateCalendarItemSchema>;
