/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Lawn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "waterOrdinance" TEXT,
    "address" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "year" TEXT NOT NULL,
    "sprName" TEXT NOT NULL,
    "sprDuration" REAL NOT NULL DEFAULT 1,
    "sprRate" REAL NOT NULL DEFAULT 1,
    "sprDistributionUniformity" REAL NOT NULL DEFAULT 1,
    "sprSprayEfficiencyFactor" REAL NOT NULL DEFAULT 1,
    "sprWater" REAL NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lawn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Irrigation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "water" REAL NOT NULL DEFAULT 0,
    "lawnId" TEXT NOT NULL,
    CONSTRAINT "Irrigation_lawnId_fkey" FOREIGN KEY ("lawnId") REFERENCES "Lawn" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
