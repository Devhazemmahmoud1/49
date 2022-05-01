-- CreateTable
CREATE TABLE `RunningCost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` VARCHAR(191) NOT NULL,
    `reason` LONGTEXT NOT NULL,
    `paymentOut` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
