/*
  Warnings:

  - You are about to alter the column `totalFees` on the `PaymentGateWayFees` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.

*/
-- AlterTable
ALTER TABLE `PaymentGateWayFees` MODIFY `totalFees` DOUBLE NULL;
