/*
  Warnings:

  - You are about to drop the column `country` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Users` DROP COLUMN `country`,
    DROP COLUMN `gender`;

-- CreateTable
CREATE TABLE `userSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `settingName` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `userSettings` ADD CONSTRAINT `userSettings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
