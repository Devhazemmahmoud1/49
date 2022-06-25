/*
  Warnings:

  - You are about to alter the column `total` on the `ridesRequested` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Posts` MODIFY `totalLikes` INTEGER NULL DEFAULT 0,
    MODIFY `totalWoW` INTEGER NULL DEFAULT 0,
    MODIFY `totalAngry` INTEGER NULL DEFAULT 0,
    MODIFY `totalSad` INTEGER NULL DEFAULT 0,
    MODIFY `totalLove` INTEGER NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ridesRequested` MODIFY `total` INTEGER NOT NULL DEFAULT 0;
