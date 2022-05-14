/*
  Warnings:

  - You are about to drop the column `totalAngry` on the `reactions` table. All the data in the column will be lost.
  - You are about to drop the column `totalLikes` on the `reactions` table. All the data in the column will be lost.
  - You are about to drop the column `totalSad` on the `reactions` table. All the data in the column will be lost.
  - You are about to drop the column `totalWoW` on the `reactions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Posts` ADD COLUMN `totalAngry` INTEGER NULL,
    ADD COLUMN `totalLikes` INTEGER NULL,
    ADD COLUMN `totalLove` INTEGER NULL,
    ADD COLUMN `totalSad` INTEGER NULL,
    ADD COLUMN `totalWoW` INTEGER NULL;

-- AlterTable
ALTER TABLE `reactions` DROP COLUMN `totalAngry`,
    DROP COLUMN `totalLikes`,
    DROP COLUMN `totalSad`,
    DROP COLUMN `totalWoW`;
