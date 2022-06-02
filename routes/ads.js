const router = require('express').Router()
const guard = require('../middleware/guard')
const ads = require('../controllers/AdsController')
const multer = require('multer');
const {getFileStream, run} = require('../controllers/s3Controller/uploadS3Controller');
const {autoCatch} = require("../utils/auto_catch");

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

/* Uploading Images using Multter Package */
router.post('/upload-ads-attahcments' ,upload.array('attachments', 12), async (req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});

/* Ads API goes here */

/* Get a specific Sub category props according to the giving information */
router.get('/props/:id', autoCatch(ads.getProperties));

/* Get single ad according to the giving ID */
router.get('/single/:id', autoCatch(ads.getAd))

/* Create a new ad */
router.post('/create-ad/new', guard, autoCatch(ads.createNewAd) )

/* Edit a specific ad */
router.post('/edit-ad', guard, autoCatch(ads.EditAd))

/* add a specific ad to favo list */
router.post('/add-favo', guard, autoCatch(ads.addFavo))

/* remove a specific ad from favo list */
router.delete('/remove-favo', guard, autoCatch(ads.removeFavo))

/* Get my favorate list */
router.get('/get-myfavorate', guard, autoCatch(ads.getMyfavorates))

module.exports = router