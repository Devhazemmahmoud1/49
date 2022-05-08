-- CreateTable
CREATE TABLE `saraha` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` TEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `sentTo` INTEGER NOT NULL,
    `picturesRate` INTEGER NOT NULL DEFAULT 0,
    `postsRate` INTEGER NOT NULL DEFAULT 0,
    `engagment` INTEGER NOT NULL DEFAULT 0,
    `totalRate` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
