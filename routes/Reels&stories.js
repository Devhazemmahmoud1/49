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
    let { videoDuration, song_id, userId } = req.body
    let result = await uploadMethod.getFileStream(file)

    await db.reels.create({
        data: {
            user_id: parseInt(userId),
            videoThumbUrl: result[1].filename ?? 0,
            videoDuration: parseInt(videoDuration),
            videoUrl: result[0].filename,
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

router.get('/get/my-reel/:id', guard, reels.getOneReel)

router.get('/get-list-of-my-reels', guard, reels.getMyReels)

router.get('/public-reels-of-people', guard, reels.publicReels)

/* Create a story */

/* Get My stories */


/* Get Friends and followers Stories */


module.exports = router