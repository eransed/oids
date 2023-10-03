-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player',
    "darkMode" BOOLEAN NOT NULL DEFAULT true,
    "image" TEXT NOT NULL DEFAULT 'Avatar'
);
INSERT INTO "new_User" ("createdAt", "darkMode", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "darkMode", "email", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
CREATE TABLE "new_Ship" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experience" INTEGER DEFAULT 0,
    "userId" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT 'RocketShip',
    CONSTRAINT "Ship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ship" ("createdAt", "experience", "id", "level", "name", "updatedAt", "userId") SELECT "createdAt", "experience", "id", "level", "name", "updatedAt", "userId" FROM "Ship";
DROP TABLE "Ship";
ALTER TABLE "new_Ship" RENAME TO "Ship";
CREATE UNIQUE INDEX "Ship_id_key" ON "Ship"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
