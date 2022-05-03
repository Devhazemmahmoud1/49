-- CreateTable
CREATE TABLE `ridesPendingRequests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `total` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `toLng` VARCHAR(191) NOT NULL,
    `toLat` VARCHAR(191) NOT NULL,
    `isTaken` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ridesRequested` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `rider_id` INTEGER NOT NULL,
    `distance` VARCHAR(191) NOT NULL,
    `total` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ridesRequested` ADD CONSTRAINT `ridesRequested_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ridesRequested` ADD CONSTRAINT `ridesRequested_rider_id_fkey` FOREIGN KEY (`rider_id`) REFERENCES `ride`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
