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

/* Registration route  */

router.post('/register', auth.register);

/*  Login Route  */

router.post('/login', auth.login);

/*  Change password Route  */

router.post('/change-password', guard, auth.changePassword);

/*  Reset password Route  */

//router.post('/password-reset', auth.resetPassword);

/*  Send verfication code for email Route  */

//router.post('/send-otp', auth.sendOtp);

/*  Resend verfication otp code for email Route  */

//router.post('/resend-otp', auth.reSend);

module.exports = router;
