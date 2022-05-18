-- AlterTable
ALTER TABLE `Wallet` ADD COLUMN `FreeClicksStorage` DECIMAL(9, 2) NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `dailyCashBack` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` DECIMAL(9, 2) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
