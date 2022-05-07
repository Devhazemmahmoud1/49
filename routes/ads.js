const router = require('express').Router()
const guard = require('../middleware/guard')
const ads = require('../controllers/AdsController')
var multer = require('multer')

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
router.post('/upload-ads-attahcments' ,upload.array('attachments', 12), (req, res, next) => {
    res.status(200).json(req.files)
});

/* Ads API goes here */

/* Get a specific Sub category props according to the giving information */
router.get('/props/:id', ads.getProperties);

/* Get single ad according to the giving ID */
router.get('/single/:id', ads.getAd)

/* Create a new ad */
router.post('/create-ad', guard, ads.createNewAd)

/* Edit a specific ad */
router.post('/edit-ad', guard, ads.EditAd)

/* add a specific ad to favo list */
router.post('/add-favo', guard, ads.addFavo)

/* remove a specific ad from favo list */
router.delete('/remove-favo', guard, ads.removeFavo)

module.exports = router