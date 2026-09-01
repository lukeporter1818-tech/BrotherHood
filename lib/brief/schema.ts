import { z } from "zod";

// Mirrors SAVE_BRIEF_TOOL.input_schema. Validated at the boundary — if the
// model produces something malformed despite the tool schema, we surface a
// clear error rather than persisting garbage into Prisma.Json.
export const BriefItemSchema = z.object({
  headline: z.string().min(1),
  blurb: z.string().min(1),
  url: z.string().url().optional(),
});

export const BriefSectionSchema = z.object({
  topic: z.string().min(1),
  items: z.array(BriefItemSchema).min(3).max(5),
});

export const BriefPayloadSchema = z.object({
  sections: z.array(BriefSectionSchema).min(1),
});

export type BriefItem = z.infer<typeof BriefItemSchema>;
export type BriefSection = z.infer<typeof BriefSectionSchema>;
export type BriefPayload = z.infer<typeof BriefPayloadSchema>;
