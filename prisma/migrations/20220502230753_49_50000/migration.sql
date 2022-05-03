-- CreateTable
CREATE TABLE `HealthCare` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contact_number` VARCHAR(191) NULL,
    `specification` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `waitingPeriod` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HealthCareAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `health_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocWorkingDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_en` VARCHAR(191) NOT NULL,
    `day_ar` VARCHAR(191) NOT NULL,
    `doc_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HealthCareAttachments` ADD CONSTRAINT `HealthCareAttachments_health_id_fkey` FOREIGN KEY (`health_id`) REFERENCES `HealthCare`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocWorkingDays` ADD CONSTRAINT `DocWorkingDays_doc_id_fkey` FOREIGN KEY (`doc_id`) REFERENCES `HealthCare`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
