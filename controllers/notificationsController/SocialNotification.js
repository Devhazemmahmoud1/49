const app = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const admin  = require('firebase-admin')

/* Storing the notification into the database */
let sendNotification = async (notify, user) => {
    // insert notification into the database according to the giving information
    try {

        await db.notifications.create({
            data: {
                sender_id: notify.sender,
                reciever_id: notify.reciever,
                message_en: notify.notification_en,
                messgae_ar: notify.notification_ar,
                type: notify.type,
                direction: notify.postId ?? 0,
                is_read: 0,
            }
        })

        let getUserFCM = await db.users.findFirst({
            where: {
                id: parseInt(notify.reciever)
            }
        })

        let getTheLanguage = await db.userSettings.findFirst({
            where: {
                user_id: parseInt(notify.reciever),
                identifier: 9,
            }
        })

        admin.messaging().send({
            data: {
                senderInfo: user.toString(),
                postId: (notify.postId).toString() ?? "0",
                type: "1"
            },  
            token: getUserFCM.fcm,
            notification: {
              title: getTheLanguage.value == 'en_US' ? 'New notification': 'اشعار جديد',
              body: getTheLanguage.value == 'en_US' ? notify.notification_en.toString() : notify.notification_ar.toString(),
            }
        })

    } catch (e) {
        console.log(e);
        return false;
    }

    return true
}

let sendBulkNotification = async (notify, user) => {

    let duplicatedUsers = []

    let getfriends = await db.friends.findMany({
        where: {
            user_id: parseInt(notify.sender)
        }
    })   

    for (item of getfriends) {
        if (duplicatedUsers.includes(item.friend_id)) {
            continue;
        } else {
            await db.notifications.create({
                data: {
                    sender_id: notify.sender,
                    reciever_id: item.friend_id,
                    message_en: notify.notification_en,
                    messgae_ar: notify.notification_ar,
                    type: notify.type,
                    direction: notify.postId ?? 0,
                    is_read: 0,
                }
            })

            let getUserFCM = await db.users.findFirst({
                where: {
                    id: parseInt(item.friend_id)
                }
            })
    
            let getTheLanguage = await db.userSettings.findFirst({
                where: {
                    user_id: parseInt(item.friend_id),
                    identifier: 9,
                }
            })
    
            admin.messaging().send({
                data: {
                    senderInfo: user.toString(),
                    postId: (notify.postId).toString() ?? "0",
                    type: "1"
                },  
                token: getUserFCM.fcm,
                notification: {
                  title: getTheLanguage.value == 'en_US' ? 'New notification': 'اشعار جديد',
                  body: getTheLanguage.value == 'en_US' ? notify.notification_en.toString() : notify.notification_ar.toString(),
                }
            })
        }

        duplicatedUsers.push(...item.friend_id)
    }

    let getFollowers = await db.followers.findMany({
        where: {
            follower_id: parseInt(notify.sender)
        }
    })

    for (item of getFollowers) {
        if (duplicatedUsers.includes(item.user_id)) {
            continue;
        } else {
            await db.notifications.create({
                data: {
                    sender_id: notify.sender,
                    reciever_id: item.user_id,
                    message_en: notify.notification_en,
                    messgae_ar: notify.notification_ar,
                    type: notify.type,
                    direction: notify.postId ?? 0,
                    is_read: 0,
                }
            })
        }

        let getUserFCM = await db.users.findFirst({
            where: {
                id: parseInt(item.user_id)
            }
        })

        let getTheLanguage = await db.userSettings.findFirst({
            where: {
                user_id: parseInt(item.user_id),
                identifier: 9,
            }
        })

        admin.messaging().send({
            data: {
                senderInfo: user.toString(),
                postId: (notify.postId).toString() ?? "0",
                type: "1"
            },  
            token: getUserFCM.fcm,
            notification: {
              title: getTheLanguage.value == 'en_US' ? 'New notification': 'اشعار جديد',
              body: getTheLanguage.value == 'en_US' ? notify.notification_en.toString() : notify.notification_ar.toString(),
            }
        })

        duplicatedUsers.push(...item.user_id)        
    }

    return true
}

module.exports = { sendNotification, sendBulkNotification }