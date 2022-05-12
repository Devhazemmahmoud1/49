var router = require('express').Router()
var settings = require('../controllers/Settings&PrivacyController')
var guard = require('../middleware/guard')

/* User settings APIS goes down below */

/* Get user serttings */
router.get('/user-settings', guard, settings.getSettings)

/*  Edit on user settings  */
router.post('/edit', guard, settings.editSettings)

/* Edit on user privacy */
router.post('/edit-privacy', guard, settings.editPrivacy)
module.exports = router