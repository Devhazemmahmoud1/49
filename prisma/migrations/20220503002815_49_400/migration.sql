-- CreateTable
CREATE TABLE `AdsAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `ad_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdsAttachments` ADD CONSTRAINT `AdsAttachments_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `Advertisment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
