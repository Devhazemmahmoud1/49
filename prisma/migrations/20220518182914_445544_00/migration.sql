-- AlterTable
ALTER TABLE `Wallet` ADD COLUMN `PendingStorage` DECIMAL(9, 2) NULL DEFAULT 0,
    ADD COLUMN `refundStorage` DECIMAL(9, 2) NULL DEFAULT 0;
