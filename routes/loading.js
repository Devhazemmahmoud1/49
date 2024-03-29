const router = require('express').Router()
var guard = require('../middleware/guard')
var loading = require('../controllers/loadingController')
var multer = require('multer')
var { getFileStream, run } = require('../controllers/s3Controller/uploadS3Controller')
const {autoCatch} = require("../utils/auto_catch");

/* This Router file represents loading transportation */


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

/* create a new loading agent */

/* Upload attachments for a specific agent */
/* Uploading Images using Multter Package */
router.post('/upload-loading-attahcments' ,upload.array('attachments', 20), async(req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});

/* Create a new loading */
router.post('/make-loading', guard, autoCatch(loading.makeNewLoading))

/* Make a transport request */
router.post('/make-request', guard,autoCatch( loading.createNewLoadingRequest))

/* Upload images for this shipment */
router.post('/upload-shipment',upload.array('attachments', 12), (req, res, next) => {
    res.status(200).json(req.files)
});

/* Notifiction is required to send the pending requests to the other agents */
//router.get('');



/* Loading dashboard */
router.get('/my-loading-profile', guard, autoCatch(loading.myDashboard))

router.delete('/delete-loading/agent', guard, autoCatch( loading.deleteLoadingAgent ))

module.exports = router