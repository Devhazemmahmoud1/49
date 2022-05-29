const router = require('express').Router()
const guard = require('../middleware/guard')
const rest = require('../controllers/resturantsController')
var multer = require('multer')
var { getFileStream, run } = require('../controllers/s3Controller/uploadS3Controller')
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
router.post('/upload-resturant-attahcments' ,upload.array('attachments', 12), async (req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});

/* Uploading Images using Multter Package */
router.post('/upload-resturant-meal-attachments' ,upload.array('attachments', 12), async (req, res, next) => {
    let file = req.files
    let result = await getFileStream(file)
    return res.status(200).json(result)
});
 
/* Here goes resturants APIS */
router.post('/create-rest', guard,autoCatch( rest.createResturant))

/* get list of my own resturants */
router.get('/get-resturants', guard,autoCatch( rest.getResturants))

/* Get resturant information */
router.get('/get-resturant/:id', guard,autoCatch( rest.getResturant))

/* Edit a resturant of yours */
router.post('/edit-rest', guard,autoCatch( rest.updateResturant))

/* Delete a resturant of yours */
router.delete('/delete-rest', guard,autoCatch( rest.deleteResturant))

/* Create MainCategories for a specific resturant */
router.post('/create-maincategory', guard,autoCatch( rest.createMainCategories))

/* Get resturant information */
router.get('/get-resturant-categories/:id', guard,autoCatch( rest.getResturantCategories))

/* Edit a resturant category of yours */
router.post('/edit-maincategory', guard,autoCatch( rest.updateMainCategories))

/* Delete a resturant cateogru of yours */
router.delete('/delete-maincategory', guard,autoCatch( rest.deleteMainCategories))

/* Create a new Meal for a specific category of  resturant */
router.post('/create-meal', guard,autoCatch( rest.createMealForResturant))

/* Get resturant meals information */
router.get('/get-resturant-meals/:id', guard,autoCatch( rest.getReturantMeals))

/* Edit a resturant category of yours */
router.post('/edit-meal', guard,autoCatch( rest.updateMealForResturant))

/* Delete a resturant cateogru of yours */
router.delete('/delete-meal', guard,autoCatch( rest.deleteMealForResturant))

module.exports = router