-- CreateTable
CREATE TABLE `cashBackStorage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fourtyNineGain` VARCHAR(191) NOT NULL,
    `providerCashBack` VARCHAR(191) NOT NULL,
    `requestCashBack` VARCHAR(191) NOT NULL,
    `callCashBack` VARCHAR(191) NOT NULL,
    `likeCashBack` VARCHAR(191) NOT NULL,
    `viewCashBack` VARCHAR(191) NOT NULL,
    `shareCashBack` VARCHAR(191) NOT NULL,
    `anyCashBack` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
