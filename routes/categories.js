var express = require('express');
var router = express.Router();
var categories = require('../controllers/CategoriesController')

router.get('/all', categories.getAllCategories)

router.get('/sub/:id', categories.getSubCats)

module.exports = router