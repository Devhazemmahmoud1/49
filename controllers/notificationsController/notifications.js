
const app = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const admin  = require('firebase-admin')

/* Get the latest notifications */
let userNotification = async (req, res) => {

    if (req.user == null) {
        return res.status(403).send('No user token provided')
    }

    var { page , type } = req.query

    if (!page) {
        page = 1
    }

    if (!type) {
        type = 1
    }

    let maxNotifications = 20;

    if (type == 1) {
        var notifications = await db.notifications.findMany({
            where: {
                reciever_id: req.user.id,
                taps: 1
            },
            skip: page == 1 ? 0 : (page * maxNotifications) - maxNotifications,
            take: maxNotifications,
            orderBy: {
                created_at: 'desc'
            }
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
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        }
    }

    // 49 Services
    if (type == 2) {
        var notifications = await db.notifications.findMany({
            where: {
                reciever_id: req.user.id,
                taps: 2
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
    }

    //social
    if (type == 3) {
        var notifications = await db.notifications.findMany({
            where: {
                reciever_id: req.user.id,
                taps: 3
            },
            orderBy: {
                created_at: 'desc'
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
                },
                orderBy: {
                    created_at: 'desc'
                }
            })
        }
    }

    return res.status(200).json({
        notifications: notifications,
        unReadNotifications: await db.notifications.aggregate({
            where: {
                reciever_id: req.user.id,
                is_read: 0,
            },
            _count: {
                is_read: true,
            }
        }),
    })
}

/* Update the unread notif.. */
let recentUnreadNotifications = async (req, res) => {
    if (req.user == null) {
        return res.status(403).send('No user token provided')
    }

    let count = await db.notifications.aggregate({
        where: {
            reciever_id: req.user.id,
                is_read: 1,
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

    let getUserFCM = await db.users.findFirst({
        where: {
            id: parseInt(notify.user)
        }
    })


    let getTheLanguage = await db.userSettings.findFirst({
        where: {
            user_id: parseInt(notify.user),
            identifier: 9,
        }
    })


    admin.messaging().send({
        data: {
            reciever: notify.user.toString(),
            rideId: notify.rideId == null ? "0" : notify.rideId.toString(),
            type: notify.type.toString()
        },  
        token: getUserFCM.fcm,
        notification: {
          title: getTheLanguage.value == 'en_US' ? `Hi ${ notify.userFirstName }` : `${notify.userFirstName} اهلا`,
          body: getTheLanguage.value == 'en_US' ? notify.message_en.toString() : notify.message_ar.toString(),
        }
    })
}

let cashBackNotification = async (notify) => {

    let getUserFCM = await db.users.findFirst({
        where: {
            id: parseInt(notify.user)
        }
    })


    let getTheLanguage = await db.userSettings.findFirst({
        where: {
            user_id: parseInt(notify.user),
            identifier: 9,
        }
    })


    admin.messaging().send({
        data: {
            reciever: notify.user.toString(),
            type: notify.type.toString()
        },  
        token: getUserFCM.fcm,
        notification: {
          title: getTheLanguage.value == 'en_US' ? `Hi ${ notify.userFirstName }` : `${notify.userFirstName} اهلا`,
          body: getTheLanguage.value == 'en_US' ? `You have got ${notify.amount} as cashback for sharing from 49.` : `You have got ${notify.amount} as cashback for sharing from 49.`,
        }
    })
}

let cashBackNotificationForRef = async (notify) => {

    let getUserFCM = await db.users.findFirst({
        where: {
            id: parseInt(notify.user)
        }
    })


    let getTheLanguage = await db.userSettings.findFirst({
        where: {
            user_id: parseInt(notify.user),
            identifier: 9,
        }
    })


    admin.messaging().send({
        data: {
            reciever: notify.user.toString(),
            type: notify.type.toString()
        },  
        token: getUserFCM.fcm,
        notification: {
          title: getTheLanguage.value == 'en_US' ? '49 Notification' : `اشعار ٤٩`,
          body: getTheLanguage.value == 'en_US' ? notify.message_en : notify.message_ar,
        }
    })
}

module.exports = { userNotification, setNotificationAsRead, recentUnreadNotifications, deleteNotification, pleasePayNotification, cashBackNotification, cashBackNotificationForRef }