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

        admin.messaging().send({
            token: 'fyw5I0jZSEKfSxe3tfFWJ8:APA91bGYeSQRhu0Y8PT6ISjdATVMG696zb0szfV1t575UYijn_mdqZc7y3ZsPeXRc6E9vKFSNZ75b3onIewcZ24C6YLkrF34S8SQSJHvCy_qK-i2Gs82GZlDcafy3kbSnc75GJwBZY3d',
            notification: {
              title: 'Notification title',
              body: 'hello'
            }
        })

    } catch (e) {
        console.log(e);
        return false.valueOf;
    }

    return true
}

module.exports = { sendNotification }