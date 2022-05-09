-- AlterTable
ALTER TABLE `Users` ADD COLUMN `countryCode` VARCHAR(191) NULL,
    ADD COLUMN `hashCode` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ref` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inviter` INTEGER NOT NULL,
    `invited` INTEGER NOT NULL,
    `is_new` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
