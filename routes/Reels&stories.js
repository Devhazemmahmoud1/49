const express = require('express');
const router = express.Router();
const reels = require('./../controllers/Reels&StoriesController/reelsController')
const multer = require('multer');
const uploadMethod = require('../controllers/s3Controller/uploadS3Controller');
const guard = require('../middleware/guard')
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
       /* if (!ext.includes('.mp4') && !ext.includes('.jpg') && !ext.includes('.gif') && !ext.includes('.jpeg')) {
            return callback(new Error('Only images are allowed'))
        }
        */
        callback(null, true)
    },
    limits: {
        fileSize: 100000000
    }
});


/* Create a reel */
router.post('/create-reel' ,upload.array('reel', 12), async (req, res, next) => {
    let file = req.files
    let { videoDuration, song_id, userId, type, desc } = req.body
    let result = await uploadMethod.getFileStream(file)

    await db.reels.create({
        data: {
            user_id: parseInt(userId),
            desc: desc,
            videoThumbUrl: result[1].filename ?? 0,
            videoDuration: parseInt(videoDuration),
            videoUrl: result[0].filename,
            type: parseInt(type) ?? 1,
            song: {
                connect: {
                    id: parseInt(song_id) ?? undefined
                }
            }
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'Your reel has been uploaded, please wait a few seconds',
            success_en: 'Your reel has been uploaded, please wait a few seconds'
        }
    })
});

/* Delete a reel */
router.delete('/reel/deleting', guard, reels.deleteReel)

router.get('/get/reel-by-id/:id', guard, reels.getOneReel)

router.get('/get-list-of-my-reels', guard, reels.getMyReels)

router.get('/public-reels-of-people', guard, reels.publicReels)

router.get('/get-all-songs', guard, reels.getSongs)

/* Create a story */
router.post('/create-story', upload.array('reel', 12), async (req, res, next) => {
    let file = req.files
    let { videoDuration, song_id, userId, desc, type } = req.body
    let result = await uploadMethod.getFileStream(file)

    await db.reels.create({
        data: {
            user_id: parseInt(userId),
            desc: desc,
            videoThumbUrl: result[1].filename ?? 0,
            videoDuration: parseInt(videoDuration),
            videoUrl: result[0].filename,
            type: parseInt(type) ?? 1,
            song: {
                connect: {
                    id: parseInt(song_id) ?? undefined
                }
            }
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'Your reel has been uploaded, please wait a few seconds',
            success_en: 'Your reel has been uploaded, please wait a few seconds'
        }
    })
});

/* make a like on a reel */
router.post('/like-on-reel', guard, reels.putLikeOnReel)

/* make a like on a reel */
router.post('/remove-like-from-reel', guard, reels.removeLikeFromReel)

/* add view to Reel */
router.post('/reel-views', guard, reels.addViewToReel)

/* Get my stories */
router.get('/get-my-stories', guard, reels.getMyStories)

/* Get Users Stories */
router.get('/get-user-stories/:id', guard, reels.getUserStories) 

/* Get Likes and view of my reels */
router.get('/people-who-liked/myReel/:id', guard, reels.getLikedPeople)

router.get('/get-views-of/myReel/:id', guard, reels.getViewedPeople)

module.exports = router