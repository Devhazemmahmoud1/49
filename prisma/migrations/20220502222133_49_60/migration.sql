/*
  Warnings:

  - You are about to drop the `resturantSpecificCategoryMenu` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `resturantSpecificCategoryMenu` DROP FOREIGN KEY `resturantSpecificCategoryMenu_mainCategoryId_fkey`;

-- DropTable
DROP TABLE `resturantSpecificCategoryMenu`;

-- CreateTable
CREATE TABLE `resturantSpecificCategoryMeal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mainCategoryId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `resturantSpecificCategoryMeal` ADD CONSTRAINT `resturantSpecificCategoryMeal_mainCategoryId_fkey` FOREIGN KEY (`mainCategoryId`) REFERENCES `resturantMainCategoryMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
