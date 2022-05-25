-- CreateTable
CREATE TABLE `songs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `desc` VARCHAR(191) NULL,
    `playUrl` VARCHAR(191) NOT NULL,
    `duration` INTEGER NULL,
    `thumbUrl` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `videoUrl` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `videoThumbUrl` VARCHAR(191) NOT NULL,
    `videoDuration` INTEGER NOT NULL,
    `song_id` INTEGER NOT NULL,

    UNIQUE INDEX `reels_song_id_key`(`song_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reels` ADD CONSTRAINT `reels_song_id_fkey` FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
