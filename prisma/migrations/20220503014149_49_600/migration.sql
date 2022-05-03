-- AddForeignKey
ALTER TABLE `userPropValues` ADD CONSTRAINT `userPropValues_ad_id_fkey` FOREIGN KEY (`ad_id`) REFERENCES `Advertisment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
