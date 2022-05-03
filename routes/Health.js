const router = require('express').Router()
const guard = require('../middleware/guard')
const health = require('../controllers/HealthCareController')
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
router.post('/upload-resturant-attahcments' ,upload.array('attachment', 12), (req, res, next) => {
    res.status(200).json(req.files)
});

/*  HealthCare API goes here  */
router.post('/create-healthcare', guard, health.createNewDoctorHost);

module.exports = router