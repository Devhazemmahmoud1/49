var router = require('express').Router()
var ride = require('../controllers/ridersController')
var guard = require('../middleware/guard')
var multer = require('multer')
var { getFileStream } = require('../controllers/s3Controller/uploadS3Controller')
const {autoCatch} = require("../utils/auto_catch");

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
router.post('/upload-rider-attahcments' ,upload.array('attachments', 20), async (req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});

/* This route is for registering a new Rider */
router.post('/add-rider', guard ,autoCatch( ride.addRider));

/* This is for requesting ride and getting the people who's around a specfic point 5 KMs */
router.get('/find-drivers', guard, autoCatch( ride.findRiders ))

/* This is for toggle a driver status */
router.post('/driver-status-switch', guard, autoCatch( ride.driversToggleStatus ))

/* Updates all drivers location */
router.post('/update/drivers-location', autoCatch( ride.updateDriversLocation ))

/* Accept a ride and keep it as pending  */
router.post('/add-trip-to-pending', guard, autoCatch( ride.addPendingRide ))

/* Set aa final destination */
router.post('/add-final-destination', guard, autoCatch( ride.addFinalDestination ))

/* This route is for accepting rides requests */
router.post('/accept-ride', guard,autoCatch( ride.acceptRide))

module.exports = router