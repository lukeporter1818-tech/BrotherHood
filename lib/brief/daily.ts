import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { anthropic, BRIEF_MODEL } from "@/lib/brief/anthropic";
import { BLOCKED_DOMAINS } from "@/lib/brief/sources";

const DAILY_STORY_SYSTEM_PROMPT = `You are selecting ONE recent news story to open The Brotherhood — a men's community app — each morning. The reader is a man checking in before his day starts. Your job: find a specific, concrete, recent story about men, male friendship, mentorship, fatherhood, or community action that gives him something real to carry into the day. Not fluff, not viral "wholesome moment" content, not a "men can be good too" take — a story that would stand on its own as straight reporting in a city paper or on a regional news desk.

## What to look for

- A real event from the last 7 days (prefer the last 72 hours). Something that actually happened to specific, named people in a specific place.
- Mentorship, coaching, father-son, veteran peer outreach, men's groups, community rebuilding, volunteer action, recovery milestones, a man or group of men quietly doing something that mattered to someone else.
- Local stories often beat national ones. A city paper covering a specific coach, chaplain, mentor, or volunteer crew is usually stronger than a national trend piece.
- Straight-news desks: AP, Reuters, local daily newspapers, regional NPR affiliates, BBC regional, CBC regional, Guardian community coverage, local TV news digital sites.

## What to avoid

- "Wholesome moment" viral clips, TikTok compilations, "faith in humanity restored" roundup posts.
- Opinion pieces, columns, or essays about masculinity — regardless of political direction. Events, not takes.
- Celebrity philanthropy stunts, brand-adjacent "giving back" marketing, or anything that reads as a press release.
- Tragedies reframed as uplift ("after the shooting, the community came together…"). If the frame requires a prior horror to work, skip it.
- Stories primarily about grief, loss, serious illness, or crisis — even with a positive turn. The reader may be opening the app in a hard moment; don't start his day with a death.
- Military/combat heroism framed around violence done, versus service done. Veterans supporting other veterans at home is fine; combat recounts are not.
- Religious content that assumes a specific tradition. Interfaith or cross-community volunteering is fine.
- Politics, partisan actors, or any story whose weight depends on a political alignment.
- Anything older than 2 weeks.

## Format rules — strict

Headline
- 6–12 words. Under 100 characters.
- Concrete subject, active voice. Name the person, group, or place.
- No clickbait, no rhetorical questions, no "you won't believe," no "this [adjective] [noun]."
- No trailing punctuation, no all-caps except acronyms.

  Good: "Retired Firefighter Builds Free Woodshop For Teen Boys In Akron"
  Good: "Glasgow Veterans' Running Club Passes 500 Members After Five Years"
  Bad:  "This Dad's Response Will Melt Your Heart"
  Bad:  "A Beautiful Reminder Of What Men Can Be"

Blurb
- 2–3 sentences. Under 360 characters total.
- Sentence 1: what the person or group did. Sentence 2: scale, timeline, or who it reached. Sentence 3 (optional): one concrete detail that makes it specific.
- No editorializing ("inspiring," "heartwarming," "incredible," "shows us that"). Report what happened.
- No framing the story as a lesson for the reader.
- No "in a world where…" openings.

URL — REQUIRED
- Must link to the specific dated article for this story. Not a homepage, section index, tag page, or roundup.
- If you cannot find a direct-article URL, drop that story and find a different one. Do not call save_daily_story without a url.

## Process

1. Run 2–4 web searches with varied angles for the seed topic you were given. Use phrasings a local reporter would — a city name + "mentor," a program name + "launches" or "milestone," "men's group" + a specific action verb.
2. Pick ONE story that fits every rule above. If nothing qualifies, broaden the search once; if still nothing, pick the strongest candidate that violates the "avoid" rules least.
3. Call save_daily_story exactly once with headline, blurb, and url. Do not return your findings as text.`;

// 14-day rotation. Deterministic by UTC day — same day always lands on
// the same seed, even if the cron re-fires or we manually rerun.
const TOPIC_SEEDS = [
  "men mentoring teenage boys community program",
  "men's community group volunteering local",
  "veterans peer support program milestone",
  "father-son community initiative",
  "men's recovery group milestone sober",
  "coach high school boys mentorship impact",
  "men rebuilding neighborhood project",
  "men's running or fitness group community",
  "retired men volunteering teaching trades",
  "chaplain men's outreach program",
  "big brother mentor program expansion",
  "men's shed community workshop",
  "firefighters police coaching youth program",
  "men peer counseling group community",
] as const;

export function seedForDate(utcDate: Date): string {
  // Monotonic day-index across month/year boundaries. getUTCDate() would
  // reset to 1 on the 1st of every month and desync the rotation.
  const utcDayIndex = Math.floor(utcDate.getTime() / 86_400_000);
  return TOPIC_SEEDS[utcDayIndex % TOPIC_SEEDS.length];
}

export const DailyStorySchema = z.object({
  headline: z.string().min(1).max(100),
  blurb: z.string().min(1).max(600),
  url: z.string().url(),
});
export type DailyStory = z.infer<typeof DailyStorySchema>;

const SAVE_DAILY_STORY_TOOL = {
  name: "save_daily_story",
  description:
    "Save the finalized daily story. Call this exactly once, after searching the seed topic. Must include a direct-article url.",
  input_schema: {
    type: "object" as const,
    properties: {
      headline: { type: "string", maxLength: 100 },
      blurb: { type: "string", maxLength: 360 },
      url: { type: "string", format: "uri" },
    },
    required: ["headline", "blurb", "url"],
  },
};

const MAX_WEB_SEARCHES = 6;
const MAX_TOKENS = 8_000;

export type DailyStoryGenerationResult = {
  payload: DailyStory;
  seed: string;
  model: string;
};

export async function generateDailyStory({
  utcDate,
}: {
  utcDate: Date;
}): Promise<DailyStoryGenerationResult> {
  const seed = seedForDate(utcDate);

  const response = await anthropic.messages.create({
    model: BRIEF_MODEL,
    max_tokens: MAX_TOKENS,
    system: DAILY_STORY_SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: MAX_WEB_SEARCHES,
        blocked_domains: BLOCKED_DOMAINS,
      },
      SAVE_DAILY_STORY_TOOL,
    ],
    messages: [
      {
        role: "user",
        content: `Seed topic: ${seed}. Find one story that fits every rule in your instructions, then call save_daily_story exactly once with headline, blurb, and url.`,
      },
    ],
  });

  const saveCall = response.content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === "save_daily_story",
  );
  if (!saveCall) {
    throw new Error(
      `Daily-story model did not call save_daily_story (stop_reason: ${response.stop_reason})`,
    );
  }

  const parsed = DailyStorySchema.safeParse(saveCall.input);
  if (!parsed.success) {
    throw new Error(
      `save_daily_story input failed validation: ${parsed.error.message}`,
    );
  }

  return { payload: parsed.data, seed, model: BRIEF_MODEL };
}
