import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const rooms = [
  { slug: "sobriety",         displayName: "Sobriety",                    description: "Support and experiences with addiction and recovery.", sortOrder: 1 },
  { slug: "fatherhood",       displayName: "Fatherhood",                  description: "Being a better man, dad, and role model.",             sortOrder: 2 },
  { slug: "fitness",          displayName: "Fitness",                     description: "Training, nutrition, and physical health.",            sortOrder: 3 },
  { slug: "entrepreneurship", displayName: "Entrepreneurship & Career",   description: "Work, purpose, and building a better future.",         sortOrder: 4 },
  { slug: "relationships",    displayName: "Relationships & Marriage",    description: "Navigating relationships and communication.",          sortOrder: 5 },
  { slug: "grief",            displayName: "Grief & Loss",                description: "Processing loss and supporting each other.",           sortOrder: 6 },
  { slug: "faith",            displayName: "Faith",                       description: "Spirituality, beliefs, and life's bigger questions.",  sortOrder: 7 },
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
