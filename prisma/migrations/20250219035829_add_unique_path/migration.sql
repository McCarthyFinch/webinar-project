/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `cloud_folders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path]` on the table `cloud_notes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cloud_folders_path_key" ON "cloud_folders"("path");

-- CreateIndex
CREATE UNIQUE INDEX "cloud_notes_path_key" ON "cloud_notes"("path");
