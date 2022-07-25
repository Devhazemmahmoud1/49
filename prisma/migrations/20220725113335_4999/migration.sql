/*
  Warnings:

  - You are about to drop the column `uid` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `hash` on the `loadingRequests` table. All the data in the column will be lost.
  - Added the required column `agent_id` to the `loadingRequests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isDone` to the `loadingRequests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `loadingRequests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Users` DROP COLUMN `uid`;

-- AlterTable
ALTER TABLE `loading` ADD COLUMN `carType` VARCHAR(191) NULL,
    ADD COLUMN `isApproved` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `loadingRequests` DROP COLUMN `hash`,
    ADD COLUMN `agent_id` INTEGER NOT NULL,
    ADD COLUMN `isDone` INTEGER NOT NULL,
    ADD COLUMN `total` INTEGER NOT NULL,
    MODIFY `fromLng` VARCHAR(191) NULL,
    MODIFY `fromLat` VARCHAR(191) NULL,
    MODIFY `toLng` VARCHAR(191) NULL,
    MODIFY `toLat` VARCHAR(191) NULL,
    MODIFY `date` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `reels` ADD COLUMN `totalShares` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `ridesRequested` ADD COLUMN `ride_status` INTEGER NOT NULL DEFAULT 0;
