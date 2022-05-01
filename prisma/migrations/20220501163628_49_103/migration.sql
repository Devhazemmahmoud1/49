-- CreateTable
CREATE TABLE `loading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `carModel` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loadingAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `loading_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `loadingAttachments` ADD CONSTRAINT `loadingAttachments_loading_id_fkey` FOREIGN KEY (`loading_id`) REFERENCES `loading`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
