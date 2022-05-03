-- CreateTable
CREATE TABLE `resturants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `workFrom_en` VARCHAR(191) NOT NULL,
    `workFrom_ar` VARCHAR(191) NOT NULL,
    `workTo_en` VARCHAR(191) NOT NULL,
    `workTo_ar` VARCHAR(191) NOT NULL,
    `contant_number` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restWorkingDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_en` VARCHAR(191) NOT NULL,
    `day_ar` VARCHAR(191) NOT NULL,
    `resturant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturantAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `resturant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturantMainCategoryMenu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `resturant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturantSpecificCategoryMenu` (
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
ALTER TABLE `restWorkingDays` ADD CONSTRAINT `restWorkingDays_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantAttachments` ADD CONSTRAINT `resturantAttachments_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantMainCategoryMenu` ADD CONSTRAINT `resturantMainCategoryMenu_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantSpecificCategoryMenu` ADD CONSTRAINT `resturantSpecificCategoryMenu_mainCategoryId_fkey` FOREIGN KEY (`mainCategoryId`) REFERENCES `resturantMainCategoryMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
