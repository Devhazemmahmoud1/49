/*
  Warnings:

  - You are about to drop the column `generatedBalance` on the `Profit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Profit` DROP COLUMN `generatedBalance`,
    ADD COLUMN `profit` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `wallet` DOUBLE NULL DEFAULT 0;
