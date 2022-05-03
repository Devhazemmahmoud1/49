-- CreateTable
CREATE TABLE `loadingRequests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `agent_id` INTEGER NOT NULL,
    `fromLng` VARCHAR(191) NOT NULL,
    `fromLat` VARCHAR(191) NOT NULL,
    `toLng` VARCHAR(191) NOT NULL,
    `toLat` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loadingShippingAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `loadingRequests` ADD CONSTRAINT `loadingRequests_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `loading`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loadingShippingAttachment` ADD CONSTRAINT `loadingShippingAttachment_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `loadingRequests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
