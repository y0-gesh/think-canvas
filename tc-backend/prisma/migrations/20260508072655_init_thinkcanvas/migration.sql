/*
  Warnings:

  - You are about to drop the column `data` on the `Canvas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_canvasId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_canvasId_fkey";

-- AlterTable
ALTER TABLE "Canvas" DROP COLUMN "data";

-- AlterTable
ALTER TABLE "Edge" ALTER COLUMN "type" SET DEFAULT 'default';

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "height" DOUBLE PRECISION NOT NULL DEFAULT 140,
ADD COLUMN     "width" DOUBLE PRECISION NOT NULL DEFAULT 220,
ALTER COLUMN "type" SET DEFAULT 'think';

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "nodeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canvas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
