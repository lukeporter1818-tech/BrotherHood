import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getDbUser = cache((userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { anonHandle: true, isAdmin: true },
  })
);

export const getRooms = cache(() =>
  prisma.room.findMany({
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
  })
);
