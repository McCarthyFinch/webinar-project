-- CreateTable
CREATE TABLE "cloud_notes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" TEXT,

    CONSTRAINT "cloud_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cloud_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" TEXT,

    CONSTRAINT "cloud_folders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cloud_notes_path_idx" ON "cloud_notes"("path");

-- CreateIndex
CREATE INDEX "cloud_folders_path_idx" ON "cloud_folders"("path");

-- AddForeignKey
ALTER TABLE "cloud_notes" ADD CONSTRAINT "cloud_notes_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "cloud_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cloud_folders" ADD CONSTRAINT "cloud_folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cloud_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
