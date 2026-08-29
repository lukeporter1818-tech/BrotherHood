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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
