import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rooms = [
  { slug: "sobriety",         displayName: "Sobriety",                    description: "Recovery, staying sober, and the work it takes.",      sortOrder: 1 },
  { slug: "fatherhood",       displayName: "Fatherhood",                  description: "Being a dad — the real parts.",                        sortOrder: 2 },
  { slug: "fitness",          displayName: "Fitness",                     description: "Training, health, and showing up for your body.",      sortOrder: 3 },
  { slug: "entrepreneurship", displayName: "Entrepreneurship & Career",   description: "Building, grinding, and figuring out your work life.", sortOrder: 4 },
  { slug: "relationships",    displayName: "Relationships & Marriage",    description: "Partnerships, divorce, and everything between.",       sortOrder: 5 },
  { slug: "grief",            displayName: "Grief & Loss",                description: "Loss in all its forms.",                               sortOrder: 6 },
  { slug: "faith",            displayName: "Faith",                       description: "Belief, doubt, and the spiritual life.",               sortOrder: 7 },
  { slug: "mental-health",    displayName: "Mental Health / Just Talking", description: "No agenda. Just men talking.",                        sortOrder: 8 },
];

async function main() {
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: { displayName: room.displayName, description: room.description, sortOrder: room.sortOrder },
      create: room,
    });
  }
  console.log(`Seeded ${rooms.length} rooms.`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
