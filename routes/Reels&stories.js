const express = require('express');
const router = express.Router();
const reels = require('./../controllers/Reels&StoriesController/reelsController')
const multer = require('multer');
const uploadMethod = require('../controllers/s3Controller/uploadS3Controller');
const guard = require('../middleware/guard')
const { sendBulkNotification } = require('../controllers/notificationsController/SocialNotification')
const {PrismaClient} = require('@prisma/client');
const {autoCatch} = require("../utils/auto_catch");
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
        /* if (!ext.includes('.mp4') && !ext.includes('.jpg') && !ext.includes('.gif') && !ext.includes('.jpeg')) {
             return callback(new Error('Only images are allowed'))
         }
         */
        callback(null, true)
    },
    limits: {
        fileSize: 1000000000
    }
});

/* Create a reel */
router.post('/create-reel', upload.array('reel', 12), async (req, res, next) => {
    try {

        let file = req.files
        let {videoDuration, song_id, userId, type, desc} = req.body
        let result = await uploadMethod.getFileStream(file)

        let createReel = await db.reels.create({
            data: {
                user_id: parseInt(userId),
                desc: desc,
                videoThumbUrl: result[1].filename ?? 0,
                videoDuration: parseInt(videoDuration),
                videoUrl: result[0].filename,
                type: parseInt(type) ?? 1,
                /*song: {
                    connect: {
                        id: parseInt(song_id) ?? undefined
                    }
                }*/
                song_id: parseInt(song_id)
            }
        })
        
        let user = await db.users.findFirst({
            where: {
                id: parseInt(userId)
            }
        })

        let notify = {
            notification_ar: '' + user.firstName + ' ' + user.lastName + ' قام باضافه ريل جديد.',
            notification_en: '' + user.firstName + ' ' + user.lastName + ' has added a new reel',
            sender: user.id,
            reciever: 0,
            postId: parseInt(createReel.id),
            type: 9,            
        }

        sendBulkNotification(notify, parseInt(userId))

        return res.status(200).json({
            success: {
                success_ar: 'Your reel has been uploaded, please wait a few seconds',
                success_en: 'Your reel has been uploaded, please wait a few seconds'
            }
        })
    } catch (e) {
        next(e)
    }
});

/* Delete a reel */
router.delete('/reel/deleting', guard, autoCatch(reels.deleteReel))

router.get('/get/reel-by-id/:id', guard, autoCatch(reels.getOneReel))

router.get('/get-list-of-my-reels', guard, autoCatch(reels.getMyReels))

router.get('/public-reels-of-people', guard, autoCatch(reels.publicReels))

router.get('/get-all-songs', guard, autoCatch(reels.getSongs))

/* Create a story */
router.post('/create-story', upload.array('reel', 12), async (req, res, next) => {
    try {

        let file = req.files
        let {videoDuration, song_id, userId, desc, type} = req.body
        let result = await uploadMethod.getFileStream(file)

        let createStory =await db.reels.create({
            data: {
                user_id: parseInt(userId),
                desc: desc,
                videoThumbUrl: result[1].filename ?? 0,
                videoDuration: parseInt(videoDuration),
                videoUrl: result[0].filename,
                type: parseInt(type) ?? 1,
                /*song: {
                    connect: {
                        id: parseInt(song_id) ?? undefined
                    }
                }*/
                song_id: parseInt(song_id)
            }
        })

        let user = await db.users.findFirst({
            where: {
                id: parseInt(userId)
            }
        })

        let notify = {
            notification_ar: '' + user.firstName + ' ' + user.lastName + ' قام باضافه قصه جديده.',
            notification_en: '' + user.firstName + ' ' + user.lastName + ' has added a new story.',
            sender: user.id,
            reciever: 0,
            postId: parseInt(createStory.id),
            type: 10,            
        }

        sendBulkNotification(notify, parseInt(userId))

        return res.status(200).json({
            success: {
                success_ar: 'Your reel has been uploaded, please wait a few seconds',
                success_en: 'Your reel has been uploaded, please wait a few seconds'
            }
        })
    } catch (e) {
        next(e)
    }
});

/* make a like on a reel */
router.post('/like-on-reel', guard, autoCatch(reels.putLikeOnReel))

/* make a like on a reel */
router.post('/remove-like/from/reel', guard, autoCatch(reels.removeLikeFromReel))

/* add view to Reel */
router.post('/reel-views/add', guard, autoCatch(reels.addViewToReel))

/* Get my stories */
router.get('/get-my-stories', guard, autoCatch(reels.getMyStories))

/* Get Users Stories */
router.get('/get-user-stories/:id', guard, autoCatch(reels.getUserStories))

/* Get Likes and view of my reels */
router.get('/people/who/liked/myReel/:id', guard, autoCatch(reels.getLikedPeople))

/*  */
router.get('/get/views/of/myReel/:id', guard, autoCatch(reels.getViewedPeople))

module.exports = router