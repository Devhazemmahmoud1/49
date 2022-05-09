const router = require('express').Router()
const guard = require('../middleware/guard')
const rest = require('../controllers/resturantsController')
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
router.post('/upload-resturant-attahcments' ,upload.array('attachment', 12), async (req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});

/* Uploading Images using Multter Package */
router.post('/upload-resturant-meal-attachments' ,upload.array('attachment', 12), async (req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});

/* Here goes resturants APIS */
router.post('/create-rest', guard, rest.createResturant)

/* Create MainCategories for a specific resturant */
router.post('/create-maincategory', guard, rest.createMainCategories)

/* Create a new Meal for a specific category of  resturant */
router.post('/create-meal', guard, rest.createMealForResturant)

module.exports = router