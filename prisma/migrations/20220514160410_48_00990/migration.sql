-- AddForeignKey
ALTER TABLE `friendRequests` ADD CONSTRAINT `friendRequests_friendRequestTo_fkey` FOREIGN KEY (`friendRequestTo`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
