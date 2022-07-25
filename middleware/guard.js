const Jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client');
const db = new PrismaClient();
const secretKey = "fourtyninehub495051fourtynine";
module.exports = ((req, res, next) => {

        var authorization = req.headers.authorization
        try {
            console.log(authorization)
            if (authorization == "Bearer NO TOKEN" || !authorization || authorization == "Bearer") {
                //eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNjU2MDg3NTI2LCJleHAiOjEzNzAyNTUyMTkyfQ.5zVZhbOKPUcZeApPeuZm8zngd_t9CgVO3g4fGm-Nji8
                req.user = null;
                console.log("this access done with No Token ! provided !")
                next()
            } else {
                authorization =authorization.split('Bearer ')[1]
                let checkToken = Jwt.verify(authorization, secretKey, async (err, data) => {
                    if (err) {
                        console.log(err)
                        req.user = null ;
                        next();
                    }
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
                            providerCashBack: true,
                            countryCode: true,
                            accountType: true,
                        }
                    });
                    if (!user) {
                        return res.status(401).send('user not found in data base');
                    }
                    req.user = user;
                    next()
                });
                if (!checkToken) {
                    req.user = null
                    next()
                }
            }
        } catch (e) {
            console.log(e)
            return res.status(401).send('unauthorized');
        }

});
