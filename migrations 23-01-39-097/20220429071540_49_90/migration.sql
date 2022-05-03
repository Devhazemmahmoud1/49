/*
  Warnings:

  - You are about to drop the column `wallet` on the `Profit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Profit` DROP COLUMN `wallet`,
    ADD COLUMN `generatedBalance` DOUBLE NULL DEFAULT 0;
