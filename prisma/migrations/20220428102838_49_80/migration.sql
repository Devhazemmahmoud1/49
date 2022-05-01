-- CreateTable
CREATE TABLE `Profit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `startBalance` DOUBLE NULL DEFAULT 0,
    `generatedBalance` DOUBLE NULL DEFAULT 0,
    `intest` INTEGER NOT NULL DEFAULT 0,
    `total` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
