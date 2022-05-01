-- CreateTable
CREATE TABLE `cashBackRules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `step` INTEGER NOT NULL,
    `requestPortion` VARCHAR(191) NOT NULL,
    `callPortion` VARCHAR(191) NOT NULL,
    `likePortion` VARCHAR(191) NOT NULL,
    `viewPortion` VARCHAR(191) NOT NULL,
    `sharePortion` VARCHAR(191) NOT NULL,
    `anyPortion` VARCHAR(191) NOT NULL,
    `xFactor` VARCHAR(191) NOT NULL,
    `overHeadPortion` VARCHAR(191) NOT NULL,
    `overHeadConstant` VARCHAR(191) NOT NULL,
    `totalGovCut` VARCHAR(191) NOT NULL,
    `virtualMoney` VARCHAR(191) NOT NULL,
    `transNum` VARCHAR(191) NOT NULL,
    `overHeadFactor` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
