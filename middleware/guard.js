const Jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const secretKey = "fourtyninehub495051fourtynine";
module.exports = ((req, res, next) => {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization.split('Bearer ')[1]
        try {
            Jwt.verify(authorization, secretKey, async(err, data) => {
                if (err) throw err;
                let user = await db.users.findFirst({
                    where: {
                        id: data.id
                    },
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        id: true,
                        is_locked: true,
                        gender: true,
                        Wallet: true,
                    }
                });
                req.user = user;
                next()
            });
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
    }
});
