const router = require('express').Router()
const guard = require('../middleware/guard')
const { autoCatch } = require("../utils/auto_catch");
const { userNotification,
    setNotificationAsRead,
    deleteNotification,
    recentUnreadNotifications,
} = require('../controllers/notificationsController/notifications')

/*  Get all the available notifications */
router.get('/latest', guard, autoCatch(userNotification))

/* Set a notification as read */
router.post('/set-as-read', guard, autoCatch(setNotificationAsRead))

/* Get the recent un-read messages */
router.get('/recent/notifications', guard, autoCatch(recentUnreadNotifications))

/* Delete a specific notification */
router.delete('/recent/notification/delete', guard, autoCatch(deleteNotification))


module.exports = router