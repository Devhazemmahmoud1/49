-- CreateTable
CREATE TABLE `favorates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favorates` ADD CONSTRAINT `favorates_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `Advertisment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
