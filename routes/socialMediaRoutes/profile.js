const router = require('express').Router()
const guard = require('../../middleware/guard')
const profile = require('../../controllers/socialMediaControllers/myProfileController')
const users = require('../../controllers/socialMediaControllers/usersProfileController')
const uploadMethod = require('../../controllers/s3Controller/uploadS3Controller');
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
router.post('/upload-profile-picture' ,upload.array('attachments', 12), async (req, res, next) => {
    let file = req.files
    let result = await uploadMethod.getFileStream(file)
    await db.users.update({
        where: {
            id: parseInt(req.body.id)
        }, 
        data: {
            profilePicture: file[0].filename
        }
    })
    return res.status(200).json(result)
});

/* Uploading cover using Multter Package */
router.post('/upload-cover-picture' ,upload.array('attachments', 12), async (req, res, next) => {
    let file = req.files
    let result = await uploadMethod.getFileStream(file)
    await db.users.update({
        where: {
            id: parseInt(req.body.id)
        }, 
        data: {
            coverPicture: file[0].filename
        }
    })
    await db.posts.create({
        
    })
    return res.status(200).json(result)
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

/* Delete my post */
router.delete('/delete-single-post', guard, profile.deletePost)

/* Uploading post image using Multter Package */
router.post('/upload-post-image' ,upload.array('attachments', 12), async (req, res, next) => {
    let file = req.files
    let result = await uploadMethod.getFileStream(file)
    return res.status(200).json(result)
});

/*   This section is for other users profile   */

// get other user's profile
router.get('/:id' , guard ,users.userProfile)

// get friendLists
router.get('/friends/:id' , guard, users.getUserFriends)

// get followers Lists
router.get('/followers/:id', guard, users.getUserFollowers)

// get list of feelings to post 
router.get('/get-feelings/for-posts', guard, profile.getFeelings)

// get list of activities to post 
router.get('/get-activities/for-post', guard, profile.getActivities)

// get Post List
router.get('/posts/:id', guard ,users.getUserPosts)

// get a specific post 
router.get('/get/specific-post/:id', guard, users.getPost)

// get all my friend Requests
router.get('/get/friend-requests-all', guard, profile.getFriendRequests)

// get post comments 
router.get('/post-comments/:id', guard, profile.getComments)

// get a specifc comment reactions
router.get('/get/comment-reactions/:id', guard, profile.getCommentReactions)

// get a specifc post reactions
router.get('/get/post-reactions/:id', guard, profile.getPostsReactions)


module.exports = router