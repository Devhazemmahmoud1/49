/*
  Warnings:

  - You are about to drop the `stories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `storyViews` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `storyViews` DROP FOREIGN KEY `storyViews_story_id_fkey`;

-- AlterTable
ALTER TABLE `reels` ADD COLUMN `type` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `stories`;

-- DropTable
DROP TABLE `storyViews`;

-- CreateTable
CREATE TABLE `reelViews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `reel_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reelViews` ADD CONSTRAINT `reelViews_reel_id_fkey` FOREIGN KEY (`reel_id`) REFERENCES `reels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
