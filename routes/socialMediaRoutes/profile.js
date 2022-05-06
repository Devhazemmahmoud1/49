const router = require('express').Router()
const guard = require('../../middleware/guard')
const profile = require('../../controllers/socialMediaControllers/myProfileController')
const users = require('../../controllers/socialMediaControllers/usersProfileController')
const multer = require('multer')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


/* Add a multter API FOR UPLLOADING IMAGES  */

var store = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '---' + file.originalname)
    }
});

var upload = multer({
    storage: store,
    fileFilter: function (req, file, callback) {
        var ext = file.originalname;
        if (!ext.includes('.png') && !ext.includes('.jpg') && !ext.includes('.gif') && !ext.includes('.jpeg')) {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 100000000
    }
});

/* Uploading Profilepicture using Multter Package */
router.post('/upload-profile-picture' ,upload.array('attachments', 12), (req, res, next) => {
    return res.status(200).json(req.files)
});

/* Uploading cover using Multter Package */
router.post('/upload-cover-picture' ,upload.array('attachments', 12), (req, res, next) => {
    return res.status(200).json(req.files)
});

/* API for users profile goes over here */

/* Get my own profile information as total */
router.get('/get', guard, profile.getMyProfile)

/* Get FriendsList */
router.get('/friends', guard, profile.getMyFriends)

/* Get Followers List */
router.get('/followers', guard, profile.getMyFollowers)

/* Get my posts */
router.get('/posts', guard, profile.getMyPosts)

/* Get my block list */
router.get('/blocked', guard, profile.getMyBlockedUsers)

/* Create a new post into my profile */
router.post('/create-post', guard, profile.createPost)

/* Edit on my post  */
router.post('/edit-post', guard, profile.editPost)

/* Uploading post image using Multter Package */
router.post('/upload-post-image' ,upload.array('attachments', 12), (req, res, next) => {
    return res.status(200).json(req.files)
});

/*   This section is for other users profile   */

// get other user's profile
router.get('/:id', users.userProfile)

// get friendLists
router.get('/friends/:id', users.getUserFriends)

// get followers Lists
router.get('/followers/:id', users.getUserFollowers)

// get friendLists
router.get('/posts/:id', users.getUserPosts)

module.exports = router