const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

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

    } catch (e) {
        console.log(e);
        return false.valueOf;
    }

    return true
}

module.exports = { sendNotification }