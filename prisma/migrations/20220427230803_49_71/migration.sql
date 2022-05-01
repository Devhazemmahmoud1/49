-- AlterTable
ALTER TABLE `Users` ADD COLUMN `country` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PayoutRequests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `is_withdrawin` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
