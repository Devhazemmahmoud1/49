/*
  Warnings:

  - You are about to drop the column `overHeadConstant` on the `cashBackRules` table. All the data in the column will be lost.
  - You are about to drop the column `overHeadFactor` on the `cashBackRules` table. All the data in the column will be lost.
  - You are about to drop the column `overHeadPortion` on the `cashBackRules` table. All the data in the column will be lost.
  - You are about to drop the column `totalGovCut` on the `cashBackRules` table. All the data in the column will be lost.
  - You are about to drop the column `transNum` on the `cashBackRules` table. All the data in the column will be lost.
  - You are about to drop the column `virtualMoney` on the `cashBackRules` table. All the data in the column will be lost.
  - You are about to drop the column `xFactor` on the `cashBackRules` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `cashBackRules` DROP COLUMN `overHeadConstant`,
    DROP COLUMN `overHeadFactor`,
    DROP COLUMN `overHeadPortion`,
    DROP COLUMN `totalGovCut`,
    DROP COLUMN `transNum`,
    DROP COLUMN `virtualMoney`,
    DROP COLUMN `xFactor`;
