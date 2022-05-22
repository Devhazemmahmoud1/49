const router = require('express').Router()
const guard = require('../middleware/guard')
const rest = require('../controllers/resturantsController')
var multer = require('multer')
var { getFileStream, run } = require('../controllers/s3Controller/uploadS3Controller')

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
router.post('/create-rest', guard, rest.createResturant)

/* get list of my own resturants */
router.get('/get-resturants', guard, rest.getResturants)

/* Get resturant information */
router.get('/get-resturant/:id', guard, rest.getResturant)

/* Edit a resturant of yours */
router.post('/edit-rest', guard, rest.updateResturant)

/* Delete a resturant of yours */
router.delete('/delete-rest', guard, rest.deleteResturant)

/* Create MainCategories for a specific resturant */
router.post('/create-maincategory', guard, rest.createMainCategories)

/* Get resturant information */
router.get('/get-resturant-categories/:id', guard, rest.getResturantCategories)

/* Edit a resturant category of yours */
router.post('/edit-maincategory', guard, rest.updateMainCategories)

/* Delete a resturant cateogru of yours */
router.delete('/delete-maincategory', guard, rest.deleteMainCategories)

/* Create a new Meal for a specific category of  resturant */
router.post('/create-meal', guard, rest.createMealForResturant)

/* Get resturant meals information */
router.get('/get-resturant-meals/:id', guard, rest.getReturantMeals)

/* Edit a resturant category of yours */
router.post('/edit-meal', guard, rest.updateMealForResturant)

/* Delete a resturant cateogru of yours */
router.delete('/delete-meal', guard, rest.deleteMealForResturant)

module.exports = router