const router = require('express').Router()
const guard = require('../../middleware/guard')
const action = require('../../controllers/socialMediaControllers/socialActionsController')
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const {autoCatch} = require("../../utils/auto_catch");
const db = new PrismaClient();
//const uploadMethod = require('../../controllers/s3Controller/uploadS3Controller');

/* Social user action goes here */
/* Send a friend request */
router.post('/send-friend-request', guard,autoCatch( action.sendFriendRequest));

/* accept add request */
router.post('/accept-friend', guard,autoCatch( action.acceptFriendRequest))

/* Follow a user */
router.post('/make-follow', guard,autoCatch( action.makeFollow))

/* Make a block to a user */
router.post('/make-block', guard,autoCatch( action.makeBlock))

/* remove friend request */
router.delete('/remove-friend-request', guard,autoCatch( action.removeFriendRequestInMyList));

/* remove friend request of other people */
router.delete('/undo-friend-request', guard,autoCatch( action.UndoFriendRequest));

/* unfriend method */
router.delete('/unfriend', guard,autoCatch( action.unfriendUser))

/* unfollow method */
router.delete('/unfollow', guard,autoCatch( action.unfollowUser))

/* unBlock User */
router.delete('/unblock', guard,autoCatch( action.unblockUser))

// Add a new comment to a specifc post // 
router.post('/add-comment', guard,autoCatch( action.addNewComment));

// edit on existing comment //
router.post('/edit-comment', guard,autoCatch( action.editComment));

// delete an existing comment
router.delete('/remove-comment', guard,autoCatch( action.removeComment))

/* Add a saraha comment */
router.post('/saraha', guard,autoCatch( action.addSaraha))

/* Get my saraha messages */
router.get('/get-my-saraha/messages', guard, autoCatch( action.getSaraha ))

// search field for social media
router.get('/search', guard,autoCatch( action.searchForResult))

// edting my own privacy of post
router.post('/update-post-privacy', guard,autoCatch( action.updatePostPrivacy))

// Hide a specific post 
router.post('/hide-post', guard,autoCatch( action.hidePost))

// Report a specific User 
router.post('/report-user', guard, autoCatch( action.reportUser))

// Make like on post
router.post('/like-on-post', guard,autoCatch( action.makeLikeOnPost))

// make unlike on post
router.delete('/unlike-post', guard,autoCatch( action.makeUnlikeOnPost))

// Make like on comment
router.post('/like-on-comment', guard,autoCatch( action.makeLikeOnComment))

// make unlike on comment
router.delete('/unlike-on-comment', guard,autoCatch( action.makeUnlikeOnComment))

// add share counter
router.post('/add-share-to/post', guard, autoCatch( action.makeShare ))

module.exports = router
