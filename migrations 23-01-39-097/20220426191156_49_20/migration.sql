-- DropForeignKey
ALTER TABLE `paymentMethods` DROP FOREIGN KEY `paymentMethods_id_fkey`;

-- DropIndex
DROP INDEX `Payment_paymentMethod_fkey` ON `Payment`;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_paymentMethod_fkey` FOREIGN KEY (`paymentMethod`) REFERENCES `paymentMethods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
