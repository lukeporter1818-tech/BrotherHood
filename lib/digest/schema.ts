import { z } from "zod";

// Mirrors SAVE_DIGEST_TOOL.input_schema. Validated at the boundary — if the
// model produces something malformed despite the tool schema, we surface a
// clear error rather than persisting garbage into Prisma.Json.
export const DigestItemSchema = z.object({
  headline: z.string().min(1),
  blurb: z.string().min(1),
  url: z.string().url().optional(),
});

export const DigestSectionSchema = z.object({
  topic: z.string().min(1),
  items: z.array(DigestItemSchema).min(3).max(5),
});

export const DigestPayloadSchema = z.object({
  sections: z.array(DigestSectionSchema).min(1),
});

export type DigestItem = z.infer<typeof DigestItemSchema>;
export type DigestSection = z.infer<typeof DigestSectionSchema>;
export type DigestPayload = z.infer<typeof DigestPayloadSchema>;
