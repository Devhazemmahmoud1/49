/*
  Warnings:

  - Added the required column `tripTime` to the `ridesRequested` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripTotalTime` to the `ridesRequested` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ridesRequested` ADD COLUMN `tripTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `tripTotalTime` VARCHAR(191) NOT NULL;
