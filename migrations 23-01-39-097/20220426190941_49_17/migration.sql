-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_paymentMethod_fkey`;

-- AddForeignKey
ALTER TABLE `paymentMethods` ADD CONSTRAINT `paymentMethods_id_fkey` FOREIGN KEY (`id`) REFERENCES `Payment`(`paymentMethod`) ON DELETE RESTRICT ON UPDATE CASCADE;
