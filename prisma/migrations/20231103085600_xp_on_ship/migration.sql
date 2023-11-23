-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "variant" INTEGER NOT NULL DEFAULT 0,
    "played" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Ship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ship" ("createdAt", "experience", "id", "level", "name", "played", "updatedAt", "userId", "variant") SELECT "createdAt", coalesce("experience", 0) AS "experience", "id", "level", "name", "played", "updatedAt", "userId", "variant" FROM "Ship";
DROP TABLE "Ship";
ALTER TABLE "new_Ship" RENAME TO "Ship";
CREATE UNIQUE INDEX "Ship_id_key" ON "Ship"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;