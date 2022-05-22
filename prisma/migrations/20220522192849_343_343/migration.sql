-- DropForeignKey
ALTER TABLE `restWorkingDays` DROP FOREIGN KEY `restWorkingDays_resturant_id_fkey`;

-- DropForeignKey
ALTER TABLE `resturantAttachments` DROP FOREIGN KEY `resturantAttachments_resturant_id_fkey`;

-- DropForeignKey
ALTER TABLE `resturantMainCategoryMenu` DROP FOREIGN KEY `resturantMainCategoryMenu_resturant_id_fkey`;

-- DropForeignKey
ALTER TABLE `resturantSpecificCategoryMeal` DROP FOREIGN KEY `resturantSpecificCategoryMeal_mainCategoryId_fkey`;

-- DropForeignKey
ALTER TABLE `resturants` DROP FOREIGN KEY `resturants_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `resturants` ADD CONSTRAINT `resturants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restWorkingDays` ADD CONSTRAINT `restWorkingDays_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantAttachments` ADD CONSTRAINT `resturantAttachments_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantMainCategoryMenu` ADD CONSTRAINT `resturantMainCategoryMenu_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantSpecificCategoryMeal` ADD CONSTRAINT `resturantSpecificCategoryMeal_mainCategoryId_fkey` FOREIGN KEY (`mainCategoryId`) REFERENCES `resturantMainCategoryMenu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
