/*
  Warnings:

  - You are about to alter the column `paymentMethod` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Payment` MODIFY `paymentMethod` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_paymentMethod_fkey` FOREIGN KEY (`paymentMethod`) REFERENCES `paymentMethods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
