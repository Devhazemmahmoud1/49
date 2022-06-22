
const express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Get the latest notifications */
let userNotification = async (req, res) => {

    if (req.user == null) {
        return res.status(403).send('No user token provided')
    }

    let { page } = req.query

    if (!page) {
        page = 1
    }

    let maxNotifications = 20;

    let notifications = await db.notifications.findMany({
        where: {
            reciever_id: req.user.id
        },
        skip: page == 1 ? 0 : (page * maxNotifications) - maxNotifications,
        take: maxNotifications,
    })

    for (item of notifications) {
        item.senderInfo = await db.users.findFirst({
            where: {
                id: parseInt(item.sender_id)
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePicture: true,
            }
        })
    }

    return res.status(200).json(notifications)
}

/* Update the unread notif.. */
let recentUnreadNotifications = async (req, res) => {

    if (req.user = null) {
        return res.status(403).send('No user token provided')
    }

    let count = await db.notifications.aggregate({
        where: {
            reciever_id: req.user.id,
            is_read: 0,
        },
        _count: {
            is_read: true,
        }
    })

    return res.status(200).json(count)

}

/* Set a specific as read */
let setNotificationAsRead = async (req, res) => {
    const { id } = req.body

    if (! id ) {
        return res.status(403).json({
            error: {
                error_en: 'Something went wrong',
                error_ar: 'Something went wrong'
            }
        })
    }

    let checkIfMyNotification = await db.notifications.findFirst({
        where: {
            id: parseInt(id),
            reciever_id: req.user.id
        }
    })

    if (checkIfMyNotification) {
        await db.notifications.update({
            where: {
                id: parseInt(id)
            },
            data: {
                is_read: 1,
            }
        })
    }

    return res.status(200).send('ok')
}

/* Delete a notification */
let deleteNotification = async (req, res) => {
    const { id } = req.body

    if (! id ) {
        return res.status(403).json({
            error: {
                error_en: 'Something went wrong',
                error_ar: 'Something went wrong'
            }
        })
    }

    let checkIfMyNotification = await db.notifications.findFirst({
        where: {
            id: parseInt(id),
            reciever_id: req.user.id
        }
    })

    if (checkIfMyNotification) {
        await db.notifications.delete({
            where: {
                id: parseInt(id)
            }
        })
        return res.status(200).send('ok')
    }
}

/* Notification for our clients [ Ride section ] */
let pleasePayNotification = async (notify) => {
    admin.messaging().send({
        data: {
            senderInfo: notify.user.toString(),
            postId: notify.postId == null ? "0" : notify.postId.toString(),
            type: notify.type.toString()
        },  
        token: getUserFCM.fcm,
        notification: {
          title: getTheLanguage.value == 'en_US' ? 'New notification': 'اشعار جديد',
          body: getTheLanguage.value == 'en_US' ? notify.notification_en.toString() : notify.notification_ar.toString(),
        }
    })
}

module.exports = { userNotification, setNotificationAsRead, recentUnreadNotifications, deleteNotification, pleasePayNotification }