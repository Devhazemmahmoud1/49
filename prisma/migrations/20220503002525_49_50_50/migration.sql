/*
  Warnings:

  - Added the required column `category_id` to the `HealthCare` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `HealthCareAttachments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `loading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `resturants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `HealthCare` ADD COLUMN `category_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `HealthCareAttachments` ADD COLUMN `type` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `loading` ADD COLUMN `category_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `resturants` ADD COLUMN `category_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `ride` ADD COLUMN `category_id` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Advertisment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `desc` LONGTEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subCategoryProperties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prop_en` VARCHAR(191) NOT NULL,
    `prop_ar` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userPropValues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subCategoryProperty_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `ad_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `userPropValues_subCategoryProperty_id_key`(`subCategoryProperty_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Advertisment` ADD CONSTRAINT `Advertisment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subCategoryProperties` ADD CONSTRAINT `subCategoryProperties_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPropValues` ADD CONSTRAINT `userPropValues_subCategoryProperty_id_fkey` FOREIGN KEY (`subCategoryProperty_id`) REFERENCES `subCategoryProperties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
