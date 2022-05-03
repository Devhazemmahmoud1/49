/*
  Warnings:

  - You are about to drop the column `DistancePerKilo` on the `ride` table. All the data in the column will be lost.
  - Added the required column `distancePerKilo` to the `ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ride` DROP COLUMN `DistancePerKilo`,
    ADD COLUMN `distancePerKilo` DECIMAL(9, 2) NOT NULL;
