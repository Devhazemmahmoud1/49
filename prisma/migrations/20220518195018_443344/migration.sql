-- AlterTable
ALTER TABLE `Users` ADD COLUMN `providerCashBack` DECIMAL(9, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `cashBackStorage` MODIFY `providerCashBack` VARCHAR(191) NULL;
