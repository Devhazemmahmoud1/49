/*
  Warnings:

  - Added the required column `mainCategory_id` to the `Advertisment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory_id` to the `Advertisment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subCategory_id` to the `userPropValues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Advertisment` ADD COLUMN `mainCategory_id` INTEGER NOT NULL,
    ADD COLUMN `subCategory_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `userPropValues` ADD COLUMN `subCategory_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Advertisment` ADD CONSTRAINT `Advertisment_subCategory_id_fkey` FOREIGN KEY (`subCategory_id`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
