-- AlterTable
ALTER TABLE `Users` ADD COLUMN `uid` VARCHAR(191) NULL,
    MODIFY `ref_number` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `taps` INTEGER NOT NULL DEFAULT 0;
