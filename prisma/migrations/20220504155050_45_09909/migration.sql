/*
  Warnings:

  - Added the required column `type` to the `userPrivacy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `userPrivacy` ADD COLUMN `type` INTEGER NOT NULL;
