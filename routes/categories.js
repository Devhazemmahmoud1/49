var express = require('express');
var router = express.Router();
var categories = require('../controllers/CategoriesController')
const {autoCatch} = require("../utils/auto_catch");

router.get('/all', guard, autoCatch( categories.getAllCategories))

router.get('/sub/:id', guard, autoCatch( categories.getSubCats))

module.exports = router