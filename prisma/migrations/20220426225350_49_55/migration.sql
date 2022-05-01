-- AlterTable
ALTER TABLE `Wallet` ADD COLUMN `providerCashBack` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `cashBackRules` ADD COLUMN `overHeadConstant` VARCHAR(191) NULL,
    ADD COLUMN `overHeadFactor` VARCHAR(191) NULL,
    ADD COLUMN `overHeadPortion` VARCHAR(191) NULL,
    ADD COLUMN `totalGovCut` VARCHAR(191) NULL,
    ADD COLUMN `transNum` VARCHAR(191) NULL,
    ADD COLUMN `virtualMoney` VARCHAR(191) NULL,
    ADD COLUMN `xFactor` VARCHAR(191) NULL;
