/*
  Warnings:

  - Added the required column `direction` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `direction` INTEGER NOT NULL,
    ADD COLUMN `type` INTEGER NOT NULL;
