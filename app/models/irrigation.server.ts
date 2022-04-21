import type { Lawn, Irrigation } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Irrigation } from "@prisma/client";

export function createIrrigation({
  lawnId,
  date,
  water,
}: {
  lawnId: Lawn["id"];
  date: Irrigation["date"];
  water: Irrigation["water"];
}) {
  return prisma.irrigation.create({
    data: {
      date,
      water,
      lawnId,
    },
  });
}

export function getIrrigations({ lawnId }: { lawnId: Lawn["id"] }) {
  return prisma.irrigation.findMany({
    where: {
      lawnId,
    },
    orderBy: {
      date: "desc",
    },
  });
}

export function findIrrigation({
  lawnId,
  date,
}: Pick<Irrigation, "lawnId" | "date">) {
  return prisma.irrigation.findFirst({
    where: {
      lawnId,
      date,
    },
  });
}

export function deleteIrrigation({
  lawnId,
  date,
}: Pick<Irrigation, "lawnId" | "date">) {
  return prisma.irrigation.deleteMany({
    where: { lawnId, date },
  });
}
