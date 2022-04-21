import type { User, Lawn } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Lawn } from "@prisma/client";

export function getLawn({
  id,
  userId,
}: Pick<Lawn, "id"> & {
  userId: User["id"];
}) {
  return prisma.lawn.findFirst({
    where: { id, userId },
  });
}

export function getLawnListItems({ userId }: { userId: User["id"] }) {
  return prisma.lawn.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export function createLawn({
  name,
  waterOrdinance,
  placeId,
  address,
  year,
  lat,
  lng,
  sprName,
  sprDuration,
  sprRate,
  sprDistributionUniformity,
  sprSprayEfficiencyFactor,
  sprWater,
  userId,
}: Pick<
  Lawn,
  | "name"
  | "waterOrdinance"
  | "placeId"
  | "address"
  | "lat"
  | "lng"
  | "year"
  | "sprName"
  | "sprDuration"
  | "sprRate"
  | "sprDistributionUniformity"
  | "sprSprayEfficiencyFactor"
  | "sprWater"
> & {
  userId: User["id"];
}) {
  return prisma.lawn.create({
    data: {
      name,
      waterOrdinance,
      placeId,
      address,
      lat,
      lng,
      year,
      sprName,
      sprDuration,
      sprRate,
      sprDistributionUniformity,
      sprSprayEfficiencyFactor,
      sprWater,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteLawn({
  userId,
  id,
}: Pick<Lawn, "id"> & { userId: User["id"] }) {
  return prisma.lawn.deleteMany({
    where: { id, userId },
  });
}
