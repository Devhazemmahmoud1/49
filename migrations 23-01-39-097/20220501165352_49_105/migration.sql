/*
  Warnings:

  - Added the required column `type` to the `loadingAttachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `loadingAttachments` ADD COLUMN `type` INTEGER NOT NULL;
