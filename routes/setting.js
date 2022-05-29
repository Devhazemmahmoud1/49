var router = require('express').Router()
var settings = require('../controllers/Settings&PrivacyController')
var guard = require('../middleware/guard')
const {autoCatch} = require("../utils/auto_catch");

/* User settings APIS goes down below */

/* Get user serttings */
router.get('/user-settings', guard,autoCatch( settings.getSettings))

/*  Edit on user settings  */
router.post('/edit', guard,autoCatch( settings.editSettings))

/* Edit on user privacy */
router.post('/edit-privacy', guard,autoCatch( settings.editPrivacy))
module.exports = router