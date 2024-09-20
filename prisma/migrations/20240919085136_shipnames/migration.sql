/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Ship` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ship_name_key" ON "Ship"("name");
