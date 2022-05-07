const router = require('express').Router()
const guard = require('../../middleware/guard')
const action = require('../../controllers/socialMediaControllers/socialActionsController')
const multer = require('multer')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Social user action goes here */
/* Send a friend request */
router.post('/send-friend-request', guard, action.sendFriendRequest);

/* remove friend request */
router.delete('/remove-friend-request', guard, action.removeFriendRequestInMyList);

/* remove friend request of other people */
router.delete('/undo-friend-request', guard, action.UndoFriendRequest);

/* unfriend method */
router.delete('/unfriend', guard, action.unfriendUser)

/* unfollow method */
router.delete('/unfollow', guard, action.unfollowUser)

/* unBlock User */
router.delete('/unblock', guard, action.unblockUser)

// Add a new comment to a specifc post // 
router.post('/add-comment', guard, action.addNewComment);

// edit on existing comment //
router.post('/edit-comment', guard, action.editComment);

module.exports = router