const router = require('express').Router()
const guard = require('../../middleware/guard')
const action = require('../../controllers/socialMediaControllers/socialActionsController')
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
//const uploadMethod = require('../../controllers/s3Controller/uploadS3Controller');

/* Social user action goes here */
/* Send a friend request */
router.post('/send-friend-request', guard, action.sendFriendRequest);

/* accept add request */
router.post('/accept-friend', guard, action.acceptFriendRequest)

/* Follow a user */
router.post('/make-follow', guard, action.makeFollow)

/* Make a block to a user */
router.post('/make-block', guard, action.makeBlock)

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

// delete an existing comment
router.delete('/remove-comment', guard, action.removeComment)

/* Add a saraha comment */
router.post('/saraha', guard, action.addSaraha)

// search field for social media
router.get('/search', guard, action.searchForResult)

// edting my own privacy of post
router.post('/update-post-privacy', guard, action.updatePostPrivacy)

// Hide a specific post 
router.post('/hide-post', guard, action.hidePost)

// Report a specific User 
router.post('/report-user', guard, action.reportUser)

// Make like on post
router.post('/like-on-post', guard, action.makeLikeOnPost)

// make unlike on post
router.delete('/unlike-post', guard, action.makeUnlikeOnPost)

// Make like on comment
router.post('/like-on-comment', guard, action.makeLikeOnComment)

// make unlike on comment
router.delete('/unlike-on-comment', guard, action.makeUnlikeOnComment)

module.exports = router