-- CreateTable
CREATE TABLE `ride` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `carModel` VARCHAR(255) NOT NULL,
    `DistancePerKilo` DECIMAL(9, 2) NOT NULL,
    `isApproved` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ridersAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rideId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ride` ADD CONSTRAINT `ride_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ridersAttachment` ADD CONSTRAINT `ridersAttachment_rideId_fkey` FOREIGN KEY (`rideId`) REFERENCES `ride`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
