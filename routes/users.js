var express = require('express');
const { route } = require('.');
var router = express.Router();
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const auth = require('../controllers/AuthController')
const guard = require('../middleware/guard')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Registration ٍٍٍٍoute  */
router.post('/register', auth.register);

/*  Login Route  */
router.post('/login', auth.login);

/*  Change password Route  */
router.post('/change-password', guard, auth.changePassword);

/*  Reset password Route  */
router.post('/password-reset', guard, auth.resetPassword);

router.delete('/delete-user', async (req, res) => {
  const { phone } = req.body

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
