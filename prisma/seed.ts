import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rooms = [
  {
    slug: "the-job-site",
    displayName: "The Job Site",
    description: "Work, ambition, grind. Wins, losses, and the slog between.",
  },
  {
    slug: "the-basement",
    displayName: "The Basement",
    description: "The heavy stuff. Grief, shame, the thoughts you don't say out loud.",
  },
  {
    slug: "the-field",
    displayName: "The Field",
    description: "Body, movement, health. Training, injuries, the discipline of showing up.",
  },
  {
    slug: "the-post",
    displayName: "The Post",
    description: "Fatherhood, partnership, family. The people you're accountable to.",
  },
];

// Demo squads for the Friday pitch. Idempotent via findFirst-by-name since
// Squad has no unique key. If we add real squad creation UX later, drop this.
const demoSquads = [
  {
    name: "The Morning Crew",
    description: "Guys checking in before 8am. Wins, grinds, first coffee.",
  },
  {
    name: "New Dads",
    description:
      "Sleep deprivation, marriage strain, the weird identity shift. No advice unless asked.",
  },
  {
    name: "Between Jobs",
    description:
      "Job hunting, interview reps, keeping your head straight when the calendar's empty.",
  },
];

// Demo shortcut: auto-join Luke to the first two squads so the pitch demo
// works out-of-the-box after a reset. Hardcoded user ID — replace when real
// squad membership flows exist.
const DEMO_AUTO_JOIN_USER_ID = "506ace2f-c2dc-4296-8175-e04f39d53153";
const DEMO_AUTO_JOIN_SQUAD_INDEXES = [0, 1];

// Fake User rows for The Bench demo. UUIDs are stable so re-seeds are
// idempotent; anonHandles are unique so they satisfy the User.anonHandle
// unique constraint. These users have no Supabase auth entry so they can
// never sign in — they exist purely to populate the mentor/seeker browse
// experience so Luke's demo user has real profiles to interact with.
const benchDemoUsers = [
  { id: "1b000000-0000-0000-0000-000000000001", realName: "Marcus", anonHandle: "mentor_marcus", hoursListened: 12.5 },
  { id: "1b000000-0000-0000-0000-000000000002", realName: "James", anonHandle: "mentor_james", hoursListened: 4.2 },
  { id: "1b000000-0000-0000-0000-000000000003", realName: "David", anonHandle: "mentor_david", hoursListened: 22.1 },
  { id: "1b000000-0000-0000-0000-000000000004", realName: "Ray", anonHandle: "mentor_ray", hoursListened: 8.7 },
  { id: "1b000000-0000-0000-0000-000000000005", realName: "Ben", anonHandle: "mentor_ben", hoursListened: 3.4 },
  { id: "1b000000-0000-0000-0000-000000000006", realName: "Alex", anonHandle: "seeker_alex", hoursListened: 0 },
  { id: "1b000000-0000-0000-0000-000000000007", realName: "Chris", anonHandle: "seeker_chris", hoursListened: 0 },
];

const benchProfiles: Array<{
  userId: string;
  journey:
    | "SOBRIETY"
    | "DIVORCE"
    | "GRIEF"
    | "FATHERHOOD"
    | "MENTAL_HEALTH"
    | "CAREER_CHANGE"
    | "OTHER";
  stageText: string;
  role: "MENTOR" | "SEEKER";
  bio: string;
}> = [
  {
    userId: "1b000000-0000-0000-0000-000000000001",
    journey: "SOBRIETY",
    stageText: "5 years sober",
    role: "MENTOR",
    bio: "Was a bottle-a-day guy for 12 years. Happy to sit with anyone in the early days.",
  },
  {
    userId: "1b000000-0000-0000-0000-000000000002",
    journey: "DIVORCE",
    stageText: "3 years post-divorce",
    role: "MENTOR",
    bio: "Kids were 8 and 11 when it happened. Rebuilt slowly. Willing to share what worked.",
  },
  {
    userId: "1b000000-0000-0000-0000-000000000003",
    journey: "FATHERHOOD",
    stageText: "Kids are teenagers now",
    role: "MENTOR",
    bio: "First-time-dad panic to teen-dad panic — different flavors, same core stuff.",
  },
  {
    userId: "1b000000-0000-0000-0000-000000000004",
    journey: "GRIEF",
    stageText: "Lost my brother 4 years ago",
    role: "MENTOR",
    bio: "Learning to carry it instead of fix it. Down to listen if you're in the fog.",
  },
  {
    userId: "1b000000-0000-0000-0000-000000000005",
    journey: "CAREER_CHANGE",
    stageText: "2 years into my second career",
    role: "MENTOR",
    bio: "Left corporate at 41, retrained as a paramedic. Terrifying and right.",
  },
  {
    userId: "1b000000-0000-0000-0000-000000000006",
    journey: "SOBRIETY",
    stageText: "Day 12",
    role: "SEEKER",
    bio: "White-knuckling. Would help to talk to someone who's been past this wall.",
  },
  {
    userId: "1b000000-0000-0000-0000-000000000007",
    journey: "DIVORCE",
    stageText: "Just got served papers last month",
    role: "SEEKER",
    bio: "Blindsided. Trying to keep it together for the kids.",
  },
];

async function main() {
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: {
        displayName: room.displayName,
        description: room.description,
      },
      create: room,
    });
  }
  console.log(`Seeded ${rooms.length} rooms.`);

  const seededSquadIds: string[] = [];
  for (const squad of demoSquads) {
    const existing = await prisma.squad.findFirst({
      where: { name: squad.name },
      select: { id: true },
    });
    if (existing) {
      seededSquadIds.push(existing.id);
    } else {
      const created = await prisma.squad.create({
        data: squad,
        select: { id: true },
      });
      seededSquadIds.push(created.id);
    }
  }
  console.log(`Seeded ${demoSquads.length} demo squads.`);

  const userExists = await prisma.user.findUnique({
    where: { id: DEMO_AUTO_JOIN_USER_ID },
    select: { id: true },
  });
  if (userExists) {
    for (const idx of DEMO_AUTO_JOIN_SQUAD_INDEXES) {
      await prisma.squadMembership.upsert({
        where: {
          userId_squadId: {
            userId: DEMO_AUTO_JOIN_USER_ID,
            squadId: seededSquadIds[idx],
          },
        },
        update: {},
        create: {
          userId: DEMO_AUTO_JOIN_USER_ID,
          squadId: seededSquadIds[idx],
        },
      });
    }
    console.log(
      `Auto-joined demo user to ${DEMO_AUTO_JOIN_SQUAD_INDEXES.length} squads.`,
    );
  } else {
    console.log(
      `Demo auto-join skipped — user ${DEMO_AUTO_JOIN_USER_ID} not found.`,
    );
  }

  for (const bu of benchDemoUsers) {
    await prisma.user.upsert({
      where: { id: bu.id },
      update: { realName: bu.realName, hoursListened: bu.hoursListened },
      create: {
        id: bu.id,
        realName: bu.realName,
        anonHandle: bu.anonHandle,
        hoursListened: bu.hoursListened,
      },
    });
  }
  for (const bp of benchProfiles) {
    await prisma.benchProfile.upsert({
      where: { userId: bp.userId },
      update: {
        journey: bp.journey,
        stageText: bp.stageText,
        role: bp.role,
        bio: bp.bio,
        active: true,
      },
      create: {
        userId: bp.userId,
        journey: bp.journey,
        stageText: bp.stageText,
        role: bp.role,
        bio: bp.bio,
      },
    });
  }
  console.log(
    `Seeded ${benchDemoUsers.length} bench demo users with ${benchProfiles.length} profiles.`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
