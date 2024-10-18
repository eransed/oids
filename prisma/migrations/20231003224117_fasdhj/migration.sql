/*
  Warnings:

  - Added the required column `played` to the `Ship` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experience" INTEGER DEFAULT 0,
    "userId" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'RocketShip',
    "played" INTEGER NOT NULL,
    CONSTRAINT "Ship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ship" ("createdAt", "experience", "id", "image", "level", "name", "updatedAt", "userId") SELECT "createdAt", "experience", "id", "image", "level", "name", "updatedAt", "userId" FROM "Ship";
DROP TABLE "Ship";
ALTER TABLE "new_Ship" RENAME TO "Ship";
CREATE UNIQUE INDEX "Ship_id_key" ON "Ship"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
