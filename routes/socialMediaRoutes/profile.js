const router = require('express').Router()
const guard = require('../../middleware/guard')
const profile = require('../../controllers/socialMediaControllers/myProfileController.js');
const users = require('../../controllers/socialMediaControllers/usersProfileController');
const uploadMethod = require('../../controllers/s3Controller/uploadS3Controller');
const multer = require('multer');
const {PrismaClient} = require('@prisma/client');
const {autoCatch} = require("../../utils/auto_catch");
const db = new PrismaClient();
const { sendBulkNotification } = require('../../controllers/notificationsController/SocialNotification')


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
router.post('/upload-profile-picture', upload.array('attachments', 12), async (req, res, next) => {
    try {

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

        let createNewAd = await db.posts.create({
            data: {
                post_content:  '',
                total_comments: 0,
                total_reactions: 0,
                feeling_id:  0,
                activity_id:  0,
                location: '',
                lat:  '',
                lng: '',
                type: 1,
                user_id: parseInt(req.body.id)
            }
        })

        for (item of file) {
            await db.postAttachments.create({
                data: {
                    post_id: createNewAd.id,
                    url: item.filename,
                    type: 1
                }
            })
        }

        let getUser = await db.users.findFirst({
            where: {
                id: parseInt(req.body.id)
            }
        })

        let notify = {
            notification_ar: '' + getUser.firstName + ' ' + getUser.lastName + ' قام بتغيير صوره الملف الشخصي.',
            notification_en: '' + getUser.firstName + ' ' + getUser.lastName + ' has changed their profile picture.',
            sender: parseInt(req.body.id),
            reciever: 0,
            postId: createNewAd.id,
            type: 1,
        }

        await sendBulkNotification(notify, getUser);

        return res.status(200).json(result)
    } catch (e) {
        next(e)
    }
});

/* Uploading cover using Multter Package */
router.post('/upload-cover-picture', upload.array('attachments', 12), async (req, res, next) => {
    try {

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
        let createNewAd = await db.posts.create({
            data: {
                post_content:  '',
                total_comments: 0,
                total_reactions: 0,
                feeling_id:  0,
                activity_id:  0,
                location: '',
                lat:  '',
                lng: '',
                type: 1,
                user_id: parseInt(req.body.id)
            }
        })

        for (item of file) {
            await db.postAttachments.create({
                data: {
                    post_id: createNewAd.id,
                    url: item.filename,
                    type: 1
                }
            })
        }

        let getUser = await db.users.findFirst({
            where: {
                id: parseInt(req.body.id)
            }
        })

        let notify = {
            notification_ar: '' + getUser.firstName + ' ' + getUser.lastName + ' قام بتغيير صوره الغلاف الشخصي.',
            notification_en: '' + getUser.firstName + ' ' + getUser.lastName + ' has changed their cover picture.',
            sender: parseInt(req.body.id),
            reciever: 0,
            postId: createNewAd.id,
            type: 1,
        }

        await sendBulkNotification(notify, getUser);

        return res.status(200).json(result)
    } catch (e) {
        next(e)
    }
});


/* Uploading cover using Multter Package */
router.post('/user/upload-to-galary', upload.array('attachments', 12), async (req, res, next) => {
    try {

        let file = req.files
        let result = await uploadMethod.getFileStream(file)

        // update to gallary proccess

        await db.gallary.create({
            data: {
                user_id: parseInt(req.body.id),
                post_id: 0,
                url: result[0].filename
            }
        })

        return res.status(200).json({
            success: {
                success_en: 'Photo has been uploaded to your albums',
                success_ar: 'تم رفع الصوره في الالبومات الخاصه بك'
            }
        })
    } catch (e) {
        next(e)
    }
});


/* Uploading cover using Multter Package */
router.post('/upload-a-new-tender-picture', upload.array('attachments', 12), async (req, res, next) => {
    try {

        let file = req.files
        let result = await uploadMethod.getFileStream(file)
        await db.users.update({
            where: {
                id: parseInt(req.body.id)
            },
            data: {
                tenderPicture: result[0].filename
            }
        })

        return res.status(200).json({
            success: {
                success_en: 'Photo has been uploaded to your Tender profile',
                success_ar: 'تم رفع الصوره في الالبومات الخاصه بك'
            }
        })
    } catch (e) {
        next(e)
    }
});

/* API for users profile goes over here */

/* Get my own profile information as total */
router.get('/get', guard, autoCatch(profile.getMyProfile))

/* Get FriendsList */
router.get('/friends', guard, autoCatch(profile.getMyFriends))

/* Get Followers List */
router.get('/followers', guard, autoCatch(profile.getMyFollowers))

/* Get my posts */
router.get('/posts', guard, autoCatch(profile.getMyPosts))

/* Get my block list */
router.get('/blocked', guard, autoCatch(profile.getMyBlockedUsers))

/* Create a new post into my profile */
router.post('/create-post', guard, autoCatch(profile.createPost))

/* Edit on my post  */
router.post('/edit-post', guard, autoCatch(profile.editPost))

/* Delete my post */
router.delete('/delete-single-post', guard, autoCatch(profile.deletePost))

/* Uploading post image using Multter Package */
router.post('/upload-post-image', upload.array('attachments', 12), async (req, res, next) => {
    try {
        let file = req.files
        let result = await uploadMethod.getFileStream(file)
        return res.status(200).json(result)
    } catch (e) {
        next(e)
    }
});

/*   This section is for other users profile   */

// get other user's profile
router.get('/:id', guard, autoCatch(users.userProfile))

// get friendLists
router.get('/friends/:id', guard, autoCatch(users.getUserFriends))

// get followers Lists
router.get('/followers/:id', guard, autoCatch(users.getUserFollowers))

// get list of feelings to post 
router.get('/get-feelings/for-posts', guard, autoCatch(profile.getFeelings))

// get list of activities to post 
router.get('/get-activities/for-post', guard, autoCatch(profile.getActivities))

// get Post List
router.get('/posts/:id', guard, autoCatch(users.getUserPosts))

// get a specific post 
router.get('/get/specific-post/:id', guard, autoCatch(users.getPost))

// get all my friend Requests
router.get('/get/friend-requests-all', guard, autoCatch(profile.getFriendRequests))

// get post comments 
router.get('/post-comments/:id', guard, autoCatch(profile.getComments))

// get a specifc comment reactions
router.get('/get/comment-reactions/:id', guard, autoCatch(profile.getCommentReactions))

// get a specifc post reactions
router.get('/get/post-reactions/:id', guard, autoCatch(profile.getPostsReactions))


/* Main Page for social */
router.get('/users/main-page', guard, autoCatch(profile.getMainPage))

router.get('/user/about/:id', guard, autoCatch(profile.getMyAbout))

router.get('/user/find/get-mygallary-list', guard, autoCatch(profile.getMyGalary))

router.post('/make-profile-picture-from-album', guard, autoCatch(profile.changeProfileFromGal))

router.get('/get/tender-list/randomely/males', guard, autoCatch(profile.getTenderMales))

router.get('/get/tender/list/randomely/females', guard, autoCatch(profile.getTenderFemales))


module.exports = router