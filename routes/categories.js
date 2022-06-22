var express = require('express');
var router = express.Router();
var categories = require('../controllers/CategoriesController')
const {autoCatch} = require("../utils/auto_catch");
const guard = require('../middleware/guard')

router.get('/all', guard, autoCatch( categories.getAllCategories))

router.get('/sub/:id', guard, autoCatch( categories.getSubCats))

router.get('/sub-category/:id', autoCatch( categories.getSpecCat ))

module.exports = router