var express = require('express');
const {route} = require('.');
var router = express.Router();
const {PrismaClient} = require('@prisma/client');
const db = new PrismaClient();

const auth = require('../controllers/AuthController')
const guard = require('../middleware/guard')
const {autoCatch} = require("../utils/auto_catch");

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

/* Registration ٍٍٍٍoute  */
router.post('/register', autoCatch(auth.register));

/*  Login Route  */
router.post('/login', autoCatch(auth.login));

/*  Change password Route  */
router.post('/change-password', guard, autoCatch(auth.changePassword));

/*  Reset password Route  */
router.post('/password-reset', guard, autoCatch(auth.resetPassword));

/*  Reset password Route  */
router.post('/forget-password' , autoCatch(auth.forgetPassword));



router.delete('/delete-user', async (req, res) => {
    const {phone} = req.body

    let checkUser = await db.users.findFirst({
        where: {
            phone: phone.toString()
        },
        include: {
            Wallet: true
        }
    })

    await db.userPrivacy.deleteMany({
        where: {
            user_id: checkUser.id
        }
    })

    await db.userSettings.deleteMany({
        where: {
            user_id: checkUser.id
        }
    })

    //console.log(checkUser.Wallet)

    await db.wallet.delete({
        where: {
            id: checkUser.Wallet.id
        }
    })


    await db.users.delete({
        where: {
            id: checkUser.id
        },
        include: {
            Ride: true,
            subscriptions: true,
            agent: true,
            ads: true,
            posts: true,
            followers: true,
            friends: true,
        }
    })

    return res.status(200).send('ok')
})

/*  Send verfication code for email Route  */

//router.post('/send-otp', auth.sendOtp);

/*  Resend verfication otp code for email Route  */

//router.post('/resend-otp', auth.reSend);

module.exports = router;


