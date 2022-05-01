const express = require('express')
const Jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client');
const secretKey = "fourtyninehub495051fourtynine";
const db = new PrismaClient();
const hash = require('bcrypt')



/* Register Method  */

let register = async (req, res, next) => {
    const { firstName, lastName , password, passwordConfirmation, gender , refNumber, phone, email, country  } = req.body

    // check if the body is empty for username and password otherwise procced 
    if (!password || !firstName || !lastName || !passwordConfirmation || !phone || !email || !gender) {
        return res.status(403).json({
            error: {
                error_ar: 'من فضلك قم بادخال جميع البيانات المطلوبه',
                error_en: 'Please fill out all the fields avaliable'
            }
        });
    }

    // validate the password
    if (password !== passwordConfirmation) {
        return res.status(403).json({
            error: {
                'error_en': 'Passwords do not match',
                'error_ar': 'كلمه السر غير صحيحه'
            }
        })
    }

    if (password.length < 8) {
        return res.status(403).json({
            error: {
                'error_en': 'Password should contain at least 8 characters',
                'error_ar': 'كلمه السر يجب ان تحتوي علي ٨ احرف علي الاقل'
            }
        })
    }

    /*if (email.includes('@gmail.com') === false || email.includes('@hotmail.com') === false || email.includes('@outlook.com') === false 
        || email.includes('@live.com') === false || email.includes('@yahoo.com') === false) {
        return res.status(403).json('Email is invaild')
    }*/

    // procced to hashing the password and creation
    let hashPassword = hash.hashSync(password, 10)

    // check if the user exists before

    let checkUser = await db.users.findFirst({
        where: {
            phone: phone,
        }, 
        select: {
            phone: true,
            id: true
        }
    });

    // check if user has already resigtered before.

    if (checkUser) {
        return res.status(403).json({
            error: {
                error_en: 'User is already registered before',
                error_ar: 'هذا المستخدم مسجل لدينا بالفعل'
            }
        });
    }       // check if user weather is blocked or not.

    let checkBlockedUser = await db.blocked_users.findFirst({
        where: {
            phone: phone
        }
    })

    if (checkBlockedUser) {
        return res.status(403).json({
            error: {
                error_en: 'This number has been blocked, Please choose another number.',
                error_ar: '.هذا الرقم محظور ، الرجا اختيار رقم آخر'
            }
        })
    }


    const create = await db.users.create({
        data: {
            firstName: firstName,
            password: hashPassword,
            phone: phone,
            email: email,
            lastName: lastName,
            is_locked: 0,
            gender: gender ?? 0,
            ref_number: refNumber ?? '',
            country: country
        }
    });


    // check if user has been created
    if (create) {

        /*var vcode = Math.floor(Math.random() * 900000).toString();

        let checkIfCodeExists = await db.codes.findFirst({
            where: {
                code: vcode
            }
        })

        if (! checkIfCodeExists) {
            await db.codes.create({
                data: {
                    user_id: create.id,
                    code: vcode
                }
            })        
        } else {
            var vcode = Math.floor(Math.random() * 900000).toString(); 
            await db.codes.create({
                data: {
                    user_id: create.id,
                    code: vcode
                }
            })   
        }

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465,
            auth: {
              user: 'garden.palace2030@gmail.com',
              pass: 'hztjqagiaksbtegs'
            }
          });

        var mailOptions = {
            from: 'garden.palace2030@gmail.com',
            to: email,
            subject: 'Vefirication code',
            text: 'Thank you for registering with garden palace this is your verification code is ' +   vcode  +  '   , Please do not share it with anyone'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
        }); */


        // create a new wallet instance for this user

        await db.wallet.create({
            data: {
                user_id: create.id,
                balance: "0",
                startBalance: '0',
                balanceAfter5: '0',
                grossMoney: "0",
                generatedBal: '0',
                profit: "0",
                total: '0',
                TenYears: "0",
                FiveYears: "0",
            }
        })
        
        // Create a new profit profile for this user

        await db.profit.create({
            data: {
                user_id: create.id,
                intest: (await db.appInfo.findFirst({})).intrest,
            }
        })


        // we need to add a verfication code plus avoid the user to login without the verf code!
        return getToken(req, res, create.id);
    }
}

/* login Method using your credintionals  */

let login = async (req, res, next) => {
    const { email , phone , password } = req.body

    // check if the body is empty for username and password otherwise procced 
    if (!email && !phone) {
        return res.status(403).json({
            error: {
                error_ar: 'اسم المستخدم مطلوب',
                error_en: 'User id is required'
            }
        });
    }

    if (!password) {
        return res.status(403).json({
            error: {
                error_ar: 'كلمه المرور غير صحيحه',
                error_en: 'Password is not correct'
            }
        });      
    }

    // validate the user
    const checkUser = await db.users.findFirst({
        where: {
            OR: [
                {
                    phone: phone ?? undefined,
                },
                {
                    email: email ?? undefined
                }
            ]
        },
        select: {
            phone: true,
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            is_locked: true,
            password: true,
            gender: true,
        }
    });
    
    // check if the user exists
    if (!checkUser) {
        return res.status(401).json({
            error: {
                error_ar: "المستخدم غير موجود",
                error_en: "User not found"
            }
        })
    }

    // validate the password 
    if (password) {
        const validPassword = hash.compareSync(password, checkUser.password);
        if (!validPassword) {
            return res.status(401).json({
                error: {
                    'error_en': 'Passwords do not match',
                    'error_ar': 'كلمه السر غير صحيحه'
                }
            })
        }
    } else {
        return res.status(404).send('Password error')
    }

    // we need to add a verfication code plus avoid the user to login without the verf code!

    // await db.users.update({
    //     where: {
    //         id: checkUser.id
    //     },
    //     data: {
    //         locked: 0
    //     }
    // })

    // procced to login process
    return getToken(req, res, checkUser.id);
}

// Generate a token to a vaild user
let getToken = async (req, res, create) => {
    const token = Jwt.sign(
        { id: create }
        , secretKey
        , { expiresIn: 6023232333 * 2, algorithm: 'HS256' }
    );
    const userData = await db.users.findUnique({
        where: {
            id: create
        },
        select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            id: true,
            is_locked: true,
        }
    });

    /* Storing user token into the response */
    userData['token'] = token;
    delete userData['password']

    /* Returning the response  */
    return res.status(200).json({
        "message": "User has been created and logged in successfully",
        "data": userData,
    });
}

let changePassword = async (req, res, next) => {
    const { oldPassword , newPassword , newPasswordConfirmation } = req.body

    if (!oldPassword || !newPassword || !newPasswordConfirmation) {
        return res.status(403).json({
            error: {
                error_en: 'Old Password is required',
                error_ar: 'كلمه المرور القديمه مطلوبه'
            }
        })
    }

    let user = await db.users.findFirst({
        where: {
            id: req.user.id
        },
        select: {
            password: true
        }
    })
    
    let validPassword = hash.compareSync(oldPassword, user.password)

    if (!validPassword) {
        if (!validPassword) {
            return res.status(401).json({
                error: {
                    'error_en': 'Passwords do not match',
                    'error_ar': 'كلمه السر غير صحيحه'
                }
            })
        }
    }

    let newpassword = hash.hashSync(newPassword, 10);

    await db.users.update({
        where: {
            id: req.user.id
        },
        data: {
            password: newpassword
        }
    })

    return res.status(200).json({
        "message_en": "Password has been changed",
        "message_ar": "تم تغيير كلمه السر بنجاح",
    })
}


module.exports = { register , login, changePassword }