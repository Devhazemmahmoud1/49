var router = require('express').Router()
var ride = require('../controllers/ridersController')
var guard = require('../middleware/guard')
var multer = require('multer')

/* Ride APis Goes down here */

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
router.post('/upload-rider-attahcments' ,upload.array('attachments', 12), (req, res, next) => {
    res.status(200).json(req.files)
});

/* This route is for registering a new Rider */
router.post('/add-rider', guard ,ride.addRider);

/* This route is for accepting rides requests */

router.post('/accept-ride', guard, ride.acceptRide)

module.exports = router