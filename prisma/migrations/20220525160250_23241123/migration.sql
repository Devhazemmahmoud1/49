-- AlterTable
ALTER TABLE `reels` ADD COLUMN `totalLikes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalViews` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `reelLikes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `reel_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reelLikes` ADD CONSTRAINT `reelLikes_reel_id_fkey` FOREIGN KEY (`reel_id`) REFERENCES `reels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
