/*
  Warnings:

  - Added the required column `type` to the `resturantAttachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `resturantAttachments` ADD COLUMN `type` INTEGER NOT NULL;
