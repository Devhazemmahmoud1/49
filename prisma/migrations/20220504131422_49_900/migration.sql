/*
  Warnings:

  - You are about to drop the column `settingName` on the `userSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `userSettings` DROP COLUMN `settingName`,
    ADD COLUMN `settingName_ar` VARCHAR(191) NULL,
    ADD COLUMN `settingName_en` VARCHAR(191) NULL;
