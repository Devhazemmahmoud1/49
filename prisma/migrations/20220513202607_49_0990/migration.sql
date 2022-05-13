-- AlterTable
ALTER TABLE `reactions` ADD COLUMN `totalAngry` INTEGER NULL,
    ADD COLUMN `totalLikes` INTEGER NULL,
    ADD COLUMN `totalSad` INTEGER NULL,
    ADD COLUMN `totalWoW` INTEGER NULL,
    MODIFY `post_id` INTEGER NULL;
