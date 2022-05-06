-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(5000) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_locked` INTEGER NOT NULL DEFAULT 0,
    `ref_number` VARCHAR(255) NOT NULL,
    `device_id` VARCHAR(100) NULL,
    `fcm` VARCHAR(300) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Blocked_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MainCategories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_en` VARCHAR(5000) NOT NULL,
    `name_ar` VARCHAR(5000) NOT NULL,
    `is_hidden` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubCategories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name_en` VARCHAR(5000) NOT NULL,
    `name_ar` VARCHAR(5000) NOT NULL,
    `is_hidden` INTEGER NOT NULL DEFAULT 0,
    `parent` INTEGER NOT NULL,
    `paymentFactor` INTEGER NOT NULL DEFAULT 0,
    `portion` INTEGER NOT NULL DEFAULT 0,
    `providerPortion` INTEGER NOT NULL DEFAULT 0,
    `dailyPrice` INTEGER NOT NULL DEFAULT 0,
    `grossMoney` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MainCategoryAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `url` VARCHAR(5000) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubCategoryAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category_id` INTEGER NOT NULL,
    `url` VARCHAR(5000) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wallet` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `balance` VARCHAR(191) NOT NULL,
    `startBalance` VARCHAR(191) NOT NULL,
    `balanceAfter5` VARCHAR(191) NOT NULL,
    `grossMoney` VARCHAR(191) NOT NULL,
    `generatedBal` VARCHAR(191) NOT NULL,
    `profit` VARCHAR(191) NOT NULL,
    `total` VARCHAR(191) NOT NULL,
    `FiveYears` VARCHAR(191) NOT NULL,
    `TenYears` VARCHAR(191) NOT NULL,
    `providerCashBack` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wallet_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WalletActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `activityType` INTEGER NOT NULL,
    `activityText` VARCHAR(5000) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `paymentIn` VARCHAR(191) NOT NULL,
    `paymentOut` VARCHAR(191) NOT NULL,
    `transNum` VARCHAR(191) NOT NULL,
    `paymentMethod` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `period` VARCHAR(5000) NOT NULL,
    `isPermium` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paymentMethods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gatewayConstant` VARCHAR(191) NOT NULL,
    `gatewayPercentage` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GovFees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `VAT` VARCHAR(191) NOT NULL,
    `Tax` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cashBackRules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `step` INTEGER NOT NULL,
    `requestPortion` VARCHAR(191) NOT NULL,
    `callPortion` VARCHAR(191) NOT NULL,
    `likePortion` VARCHAR(191) NOT NULL,
    `viewPortion` VARCHAR(191) NOT NULL,
    `sharePortion` VARCHAR(191) NOT NULL,
    `anyPortion` VARCHAR(191) NOT NULL,
    `xFactor` VARCHAR(191) NULL,
    `overHeadPortion` VARCHAR(191) NULL,
    `overHeadConstant` VARCHAR(191) NULL,
    `totalGovCut` VARCHAR(191) NULL,
    `virtualMoney` VARCHAR(191) NULL,
    `transNum` VARCHAR(191) NULL,
    `overHeadFactor` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cashBackStorage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fees` INTEGER NOT NULL DEFAULT 0,
    `fourtyNineGain` VARCHAR(191) NOT NULL,
    `providerCashBack` VARCHAR(191) NOT NULL,
    `requestCashBack` VARCHAR(191) NOT NULL,
    `callCashBack` VARCHAR(191) NOT NULL,
    `likeCashBack` VARCHAR(191) NOT NULL,
    `viewCashBack` VARCHAR(191) NOT NULL,
    `shareCashBack` VARCHAR(191) NOT NULL,
    `anyCashBack` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RunningCost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` VARCHAR(191) NOT NULL,
    `reason` LONGTEXT NOT NULL,
    `paymentOut` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentGateWayFees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `totalFees` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PayoutRequests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `amount` VARCHAR(191) NOT NULL,
    `is_withdrawin` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `intrest` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `startBalance` DOUBLE NULL DEFAULT 0,
    `generatedBalance` DOUBLE NULL DEFAULT 0,
    `intest` INTEGER NOT NULL DEFAULT 0,
    `profit` DOUBLE NULL DEFAULT 0,
    `total` DOUBLE NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ride` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `carModel` VARCHAR(255) NOT NULL,
    `distancePerKilo` DECIMAL(9, 2) NOT NULL,
    `isApproved` INTEGER NOT NULL DEFAULT 0,
    `category_id` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ridersAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rideId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ridesPendingRequests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `total` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `toLng` VARCHAR(191) NOT NULL,
    `toLat` VARCHAR(191) NOT NULL,
    `isTaken` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ridesRequested` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `rider_id` INTEGER NOT NULL,
    `distance` VARCHAR(191) NOT NULL,
    `total` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loading` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `carModel` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `hashCode` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loadingAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `loading_id` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loadingRequests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NOT NULL,
    `hash` VARCHAR(191) NOT NULL,
    `fromLng` VARCHAR(191) NOT NULL,
    `fromLat` VARCHAR(191) NOT NULL,
    `toLng` VARCHAR(191) NOT NULL,
    `toLat` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loadingShippingAttachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `request_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `workFrom_en` VARCHAR(191) NOT NULL,
    `workFrom_ar` VARCHAR(191) NOT NULL,
    `workTo_en` VARCHAR(191) NOT NULL,
    `workTo_ar` VARCHAR(191) NOT NULL,
    `contant_number` VARCHAR(191) NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restWorkingDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_en` VARCHAR(191) NOT NULL,
    `day_ar` VARCHAR(191) NOT NULL,
    `resturant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturantAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `resturant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturantMainCategoryMenu` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `resturant_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `update_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resturantSpecificCategoryMeal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mainCategoryId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HealthCare` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contact_number` VARCHAR(191) NULL,
    `specification` VARCHAR(191) NOT NULL,
    `lng` VARCHAR(191) NOT NULL,
    `lat` VARCHAR(191) NOT NULL,
    `workFrom` VARCHAR(191) NOT NULL,
    `workTo` VARCHAR(191) NOT NULL,
    `price` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `waitingPeriod` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HealthCareAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `health_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocWorkingDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_en` VARCHAR(191) NOT NULL,
    `day_ar` VARCHAR(191) NOT NULL,
    `doc_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Advertisment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `desc` LONGTEXT NOT NULL,
    `mainCategory_id` INTEGER NOT NULL,
    `subCategory_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `is_pending` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdsAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `ad_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subCategoryProperties` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prop_en` VARCHAR(191) NOT NULL,
    `prop_ar` VARCHAR(191) NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userPropValues` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subCategory_id` INTEGER NOT NULL,
    `subCategoryProperty_id` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `ad_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `userPropValues_subCategoryProperty_id_key`(`subCategoryProperty_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ad_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `settingName_ar` VARCHAR(191) NULL,
    `settingName_en` VARCHAR(191) NULL,
    `value` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userPrivacy` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `settingName_ar` VARCHAR(191) NULL,
    `settingName_en` VARCHAR(191) NULL,
    `status` INTEGER NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_content` LONGTEXT NOT NULL,
    `user_id` INTEGER NOT NULL,
    `total_reactions` INTEGER NOT NULL DEFAULT 0,
    `total_comments` INTEGER NOT NULL DEFAULT 0,
    `feeling_id` INTEGER NOT NULL,
    `activity_id` INTEGER NOT NULL DEFAULT 0,
    `location` VARCHAR(191) NULL,
    `lng` VARCHAR(191) NULL,
    `lat` VARCHAR(191) NULL,
    `type` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postFeelings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feeling_ar` VARCHAR(191) NOT NULL,
    `feeling_en` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postActivity` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity_ar` VARCHAR(191) NOT NULL,
    `activity_en` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postTags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `socialBlockedUsers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `blocked_user` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postAttachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `comment_content` TEXT NOT NULL,
    `post_id` INTEGER NOT NULL,
    `total_reactions` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `comment_id` INTEGER NULL,
    `type` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `storyType` INTEGER NOT NULL,
    `storyContent` VARCHAR(191) NULL,
    `story_attachment` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `storyViews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userViewer` INTEGER NOT NULL,
    `story_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `friends` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `friend_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `followers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `follower_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sender_id` INTEGER NOT NULL,
    `reciever_id` INTEGER NOT NULL,
    `message_en` VARCHAR(191) NOT NULL,
    `messgae_ar` VARCHAR(191) NOT NULL,
    `is_read` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SubCategories` ADD CONSTRAINT `SubCategories_parent_fkey` FOREIGN KEY (`parent`) REFERENCES `MainCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MainCategoryAttachments` ADD CONSTRAINT `MainCategoryAttachments_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `MainCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubCategoryAttachments` ADD CONSTRAINT `SubCategoryAttachments_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WalletActivity` ADD CONSTRAINT `WalletActivity_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `Wallet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_paymentMethod_fkey` FOREIGN KEY (`paymentMethod`) REFERENCES `paymentMethods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ride` ADD CONSTRAINT `ride_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ridersAttachment` ADD CONSTRAINT `ridersAttachment_rideId_fkey` FOREIGN KEY (`rideId`) REFERENCES `ride`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ridesRequested` ADD CONSTRAINT `ridesRequested_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ridesRequested` ADD CONSTRAINT `ridesRequested_rider_id_fkey` FOREIGN KEY (`rider_id`) REFERENCES `ride`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loadingAttachments` ADD CONSTRAINT `loadingAttachments_loading_id_fkey` FOREIGN KEY (`loading_id`) REFERENCES `loading`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loadingShippingAttachment` ADD CONSTRAINT `loadingShippingAttachment_request_id_fkey` FOREIGN KEY (`request_id`) REFERENCES `loadingRequests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restWorkingDays` ADD CONSTRAINT `restWorkingDays_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantAttachments` ADD CONSTRAINT `resturantAttachments_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantMainCategoryMenu` ADD CONSTRAINT `resturantMainCategoryMenu_resturant_id_fkey` FOREIGN KEY (`resturant_id`) REFERENCES `resturants`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resturantSpecificCategoryMeal` ADD CONSTRAINT `resturantSpecificCategoryMeal_mainCategoryId_fkey` FOREIGN KEY (`mainCategoryId`) REFERENCES `resturantMainCategoryMenu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HealthCareAttachments` ADD CONSTRAINT `HealthCareAttachments_health_id_fkey` FOREIGN KEY (`health_id`) REFERENCES `HealthCare`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocWorkingDays` ADD CONSTRAINT `DocWorkingDays_doc_id_fkey` FOREIGN KEY (`doc_id`) REFERENCES `HealthCare`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Advertisment` ADD CONSTRAINT `Advertisment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Advertisment` ADD CONSTRAINT `Advertisment_subCategory_id_fkey` FOREIGN KEY (`subCategory_id`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdsAttachments` ADD CONSTRAINT `AdsAttachments_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `Advertisment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subCategoryProperties` ADD CONSTRAINT `subCategoryProperties_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `SubCategories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPropValues` ADD CONSTRAINT `userPropValues_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `Advertisment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPropValues` ADD CONSTRAINT `userPropValues_subCategoryProperty_id_fkey` FOREIGN KEY (`subCategoryProperty_id`) REFERENCES `subCategoryProperties`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorates` ADD CONSTRAINT `favorates_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `Advertisment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userSettings` ADD CONSTRAINT `userSettings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `userPrivacy` ADD CONSTRAINT `userPrivacy_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postTags` ADD CONSTRAINT `postTags_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `socialBlockedUsers` ADD CONSTRAINT `socialBlockedUsers_blocked_user_fkey` FOREIGN KEY (`blocked_user`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postAttachments` ADD CONSTRAINT `postAttachments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `storyViews` ADD CONSTRAINT `storyViews_story_id_fkey` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friends` ADD CONSTRAINT `friends_friend_id_fkey` FOREIGN KEY (`friend_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `followers` ADD CONSTRAINT `followers_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_reciever_id_fkey` FOREIGN KEY (`reciever_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
