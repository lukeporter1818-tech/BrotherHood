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
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
