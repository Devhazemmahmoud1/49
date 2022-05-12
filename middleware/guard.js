const Jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const secretKey = "fourtyninehub495051fourtynine";
module.exports = ((req, res, next) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split('Bearer ')[1]
        try {
            let checkToken = Jwt.verify(authorization, secretKey, async(err, data) => {
                if (err) throw err;
                let user = await db.users.findFirst({
                    where: {
                        id: parseInt(data.id)
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        profilePicture: true,
                        coverPicture: true,
                        phone: true,
                        id: true,
                        is_locked: true,
                        Wallet: true,
                        userSettings: true,
                        userPrivacy: true,
                        fcm: true,
                        hashCode: true,
                        countryCode: true,
                    }
                });
                req.user = user;
                next()
            });
            if (!checkToken) {
                return res.status(401).send('unauthorized');
            }
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
    } else {
        return res.status(401).send('unauthorized');
    }
});
