/*
  Warnings:

  - The primary key for the `Game` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Game` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `Player` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `gameId` on the `Player` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `id` on the `Player` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "win" BOOLEAN NOT NULL,
    "played" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("id", "played", "sessionId", "userId", "win") SELECT "id", "played", "sessionId", "userId", "win" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_id_key" ON "Game"("id");
CREATE TABLE "new_Player" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gameId" INTEGER,
    CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Player" ("gameId", "id", "name") SELECT "gameId", "id", "name" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_id_key" ON "Player"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
