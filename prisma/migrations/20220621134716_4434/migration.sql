-- CreateTable
CREATE TABLE `AdsPackages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `packagePrice` INTEGER NOT NULL,
    `type` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companiesAds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,
    `adText` VARCHAR(1000) NOT NULL,
    `banner` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `companiesAds` ADD CONSTRAINT `companiesAds_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `AdsPackages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
