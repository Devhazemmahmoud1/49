const app = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const admin  = require('firebase-admin')

/* Storing the notification into the database */
let sendNotification = async (notify) => {
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
                id: notify.reciever
            }
        })

        admin.messaging().send({
            data: {
                id: notify.postId ?? 0,
                type: 1
            },  
            token: getUserFCM,
            notification: {
              title: '49 Notification',
              body: {
                ar: notify.notification_en,
                en: notify.notification_en
            },
            }
        })

    } catch (e) {
        console.log(e);
        return false.valueOf;
    }

    return true
}

module.exports = { sendNotification }