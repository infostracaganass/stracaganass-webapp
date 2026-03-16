import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  time: z.string().optional().nullable(),
  place: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const newsSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  body: z.string().optional().nullable(),
});
