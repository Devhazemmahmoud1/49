const { autoCatch } = require('../utils/auto_catch')
const router = require('express').Router()
const multer = require('multer');
const guard = require('../middleware/guard');
const uploadMethod = require('../controllers/s3Controller/uploadS3Controller');
const packages = require('../controllers/packagesController')

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

/* Get all the packages */
router.get('/get-packages', autoCatch( packages.getPackages ))

/* upload a banner for an ad */
router.post('/upload-banner', upload.array('banner', 12), async (req, res, next) => {
    let files = req.files
    let result = await uploadMethod.getFileStream(files)
    return res.json(result)
});

/* post a company ad */
router.post('/add-new/ad-for-company', guard, autoCatch( packages.postAd ))

/* Get my own ads */
router.get('/get-my-ads', guard, autoCatch( packages.getMyAds ))

/* Delete my ad */
router.delete('/delete-my-own-ad', guard, autoCatch( packages.deleteMyAd ))

module.exports = router