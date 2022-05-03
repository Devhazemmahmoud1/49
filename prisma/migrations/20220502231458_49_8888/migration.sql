/*
  Warnings:

  - Added the required column `workFrom` to the `HealthCare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workTo` to the `HealthCare` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HealthCare` ADD COLUMN `workFrom` VARCHAR(191) NOT NULL,
    ADD COLUMN `workTo` VARCHAR(191) NOT NULL;
