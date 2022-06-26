const express = require('express')
const Jwt = require('jsonwebtoken')
const {PrismaClient} = require('@prisma/client');
const secretKey = "fourtyninehub495051fourtynine";
const db = new PrismaClient();
const hash = require('bcrypt')
const notification = require('../controllers/notificationsController/notifications')
const admin = require('firebase-admin')


/* Register Method  */

let register = async (req, res) => {
    const {
        firstName,
        lastName,
        password,
        passwordConfirmation,
        gender,
        refNumber,
        phone,
        email,
        country,
        fcm,
        device_id,
        countryCode,
        lang,
        idToken,
        referralId
    } = req.body

    // check if the body is empty for username and password otherwise procced 
    if (!password || !firstName || !lastName || !passwordConfirmation || !phone || !email || !gender || !lang) {
        return res.status(403).json({
            error: {
                error_ar: 'من فضلك قم بادخال جميع البيانات المطلوبه',
                error_en: 'Please fill out all the fields avaliable'
            }
        });
    }

    if (!fcm || !device_id) {
        return res.status(403).send('FCM TOKEN AND DEVICE ID ARE REQUIRED');
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

    if (password.length < 8 || password.length > 15) {
        return res.status(403).json({
            error: {
                'error_en': 'Password should contain at least 8 characters and max of 15 characters.',
                'error_ar': ' كلمه السر يجب ان تحتوي علي ٨ احرف علي الاقل و ١٥ حرف كحد اقصي.'
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
            OR: [
                {phone: phone ?? undefined},
                {email: email ?? undefined}
            ]

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
            //gender: gender ?? 0,
            ref_number: referralId ?? '',
            //countryCode: country,
            fcm: fcm,
            device_id: device_id,
            uid: idToken ?? '',
            hashCode: Math.floor(Math.random() * 9000000000000).toString(),
            countryCode: countryCode ?? '0',
            profilePicture: gender == 1 ? 'user-profile%20MAN.png' : 'user-profile%20GIRL.png'
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

        // check if there is a hash code sent with registeration
        if (referralId) {
            // there is a hashCode provided

            // get the user provided id 
            let checkHashCode = await db.users.findFirst({
                where: {
                    hashCode: referralId
                }
            })

            if (checkHashCode) {
                let ref =await db.ref.create({
                    data: {
                        inviter: checkHashCode.id,
                        invited: create.id,
                        is_new: 0,
                    }
                })

                // do action with cashBack

                let notify = {
                    user: ref.inviter,
                    type: 1000,
                    message_en: 'Conratulations, Someone has registered using your code and you got 10 Units.',
                    message_ar: 'مبروك ، قام احدهم التسجيل باستخدام الكود الخاص بك و حصلت علي ١٠ وحدات.'
                }

                notification.cashBackNotificationForRef(notify)

                let notification = await db.notifications.create({
                    data: {
                        sender_id: 0,
                        reciever_id: ref.inviter,
                        message_en: notify.message_en,
                        message_ar: notify.message_ar,
                        is_read: 0,
                        type: 10,
                    }
                })
            }
        }

        // add new Settings to this user
        await db.userSettings.createMany({
            data: [
                {
                    identifier: 1,
                    user_id: create.id,
                    settingName_ar: ' البلد',
                    settingName_en: 'Country',
                    value: country ?? '',
                    status: 1,
                },
                {
                    identifier: 2,
                    user_id: create.id,
                    settingName_ar: 'البريد الالكتروني',
                    settingName_en: 'Email address',
                    value: email,
                    status: 1,
                },
                {
                    identifier: 3,
                    user_id: create.id,
                    settingName_ar: 'رقم الهاتف',
                    settingName_en: 'Phone number',
                    value: phone,
                    status: 1,
                },
                {
                    identifier: 4,
                    user_id: create.id,
                    settingName_ar: 'تاريخ الميلاد',
                    settingName_en: 'Birth Date',
                    value: '',
                    status: 1,
                },
                {
                    identifier: 5,
                    user_id: create.id,
                    settingName_ar: 'الحاله الاجتماعيه',
                    settingName_en: 'Social status',
                    value: '',
                    status: 1,
                },
                {
                    identifier: 6,
                    user_id: create.id,
                    settingName_ar: 'الوظيفه',
                    settingName_en: 'Job',
                    value: '',
                    status: 1,
                },
                {
                    identifier: 7,
                    user_id: create.id,
                    settingName_ar: 'المدينه',
                    settingName_en: 'City',
                    value: '',
                    status: 1,
                },
                // {
                //     user_id: create.id,
                //     settingName_ar: 'العنوان',
                //     settingName_en: 'Address',
                //     value: '',
                //     status: 0,
                // },
                {
                    identifier: 8,
                    user_id: create.id,
                    settingName_ar: 'النوع',
                    settingName_en: 'Gender',
                    value: gender.toString(),
                    status: 1,
                },
                {
                    identifier: 9,
                    user_id: create.id,
                    settingName_ar: 'اللغه',
                    settingName_en: 'Language',
                    value: lang.toString(),
                    status: 1,
                },                
            ]
        })

        // create a new Privacy for the giving user

        await db.userPrivacy.createMany({
            data: [
                {
                    user_id: create.id,
                    identifier: 1,
                    settingName_ar: 'استقبال رسايل',
                    settingName_en: 'Receive messages',
                    type: 0,
                    status: 0,
                },
                {
                    user_id: create.id,
                    identifier: 2,
                    settingName_ar: 'اخر ظهور',
                    settingName_en: 'Last seen',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 3,
                    settingName_ar: 'ظهور قرا،ه الرساله',
                    settingName_en: 'Read messages',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 4,
                    settingName_ar: 'ظهور بيانات شخصيه',
                    settingName_en: 'Personal information',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 5,
                    settingName_ar: 'ظهور الصوره الشخصيه',
                    settingName_en: 'Profile Picture',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 6,
                    settingName_ar: 'الصور الشخصيه',
                    settingName_en: 'Photos',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 7,
                    settingName_ar: 'ظهور منشورات',
                    settingName_en: 'Posts',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 8,
                    settingName_ar: 'ظهور قصص',
                    settingName_en: 'Stories',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 9,
                    settingName_ar: 'ظهور قايمه الاصدقا،',
                    settingName_en: 'Friend list',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 10,
                    settingName_ar: 'ظهور قايمه المتابعيين',
                    settingName_en: 'Followers list',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 11,
                    settingName_ar: 'ظهور نشاطيه',
                    settingName_en: 'Activity',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 12,
                    settingName_ar: 'ظهور عشوايي',
                    settingName_en: 'Random appearance',
                    type: 0,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 13,
                    settingName_ar: 'طلبات الصداقه',
                    settingName_en: 'Friend requests',
                    type: 1,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 14,
                    settingName_ar: 'طلبات المتابعه',
                    settingName_en: 'Follow requests',
                    type: 1,
                    status: 1,
                },
                {
                    user_id: create.id,
                    identifier: 15  ,
                    settingName_ar: 'المكالمات',
                    settingName_en: 'Calls',
                    type: 1,
                    status: 1,
                },
            ]
        })

        // create a new wallet instance for this user

        await db.wallet.create({
            data: {
                user_id: create.id,
                balance: "250",
                startBalance: '0',
                balanceAfter5: '0',
                grossMoney: "0",
                generatedBal: '0',
                profit: "0",
                total: '0',
                TenYears: "0",
                FiveYears: "0",
                refundStorage: 250,
            }
        })

        // Create a new profit profile for this user

        await db.profit.create({
            data: {
                user_id: create.id,
                intest: (await db.appInfo.findFirst({})).intrest,
            }
        })

        // we need to send a notification 

        let notification = await db.notifications.create({
            data: {
                sender_id: 0,
                reciever_id: ref.inviter,
                message_en: 'Thank you for registering with us.',
                message_ar: 'شكرا جزيلا للتسجيل معنا.',
                is_read: 0,
                type: 10,
            }
        })
        

        admin.messaging().send({
            token: fcm.toString(),
            notification: {
              title: lang == 'en_US' ? `Hi ${ create.firstName }` : `${create.firstName} اهلا`,
              body: lang == 'en_US' ? 'Thank you for registering with us.' : 'شكرا جزيلا للتسجيل معنا.',
            }
        })        

        // we need to add a verfication code plus avoid the user to login without the verf code!
        return getToken(req, res, create.id);
    }
}

/* login Method using your credintionals  */

let login = async (req, res, next) => {


    const {cred, password, fcm, device_id} = req.body

    // check if the body is empty for username and password otherwise procced
    if (!cred) {
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
                    phone: cred ?? undefined,
                },
                {
                    email: cred ?? undefined
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
            profilePicture: true,
            coverPicture: true,
            //gender: true,
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

    // update fcm token and device ID
    await db.users.update({
        where: {
            id: checkUser.id
        },
        data: {
            fcm: fcm,
            device_id: device_id
        }
    })

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
        {id: create}
        , secretKey
        , {expiresIn: 6023232333 * 2, algorithm: 'HS256'}
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
            profilePicture: true,
            coverPicture: true,
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
    const {oldPassword, newPassword, newPasswordConfirmation} = req.body

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

let resetPassword = async (req, res) => {
    const {newPassword, passwordConfirmation } = req.body

    if (!newPassword || !passwordConfirmation) {
        return res.status(403).json({
            error: {
                error_ar: 'كلمه السر مطلوبه.',
                error_en: 'Passwords are required.'
            }
        });
    }

    if (newPassword !== passwordConfirmation) {
        return res.status(403).json({
            error: {
                error_en: 'Passwords do not match.',
                error_ar: 'كلمه السر غير صحيحه',
            }
        })
    }

    await db.users.update({
        where: {
            id: req.user.id
        },
        data: {
            password: hash.hashSync(newPassword, 10)
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم استعاده كلمه السر.',
            success_en: 'Password has been updated.'
        }
    });

}


let forgetPassword = async (req, res) => {
    const {newPassword, passwordConfirmation, idToken } = req.body

    if (!newPassword || !passwordConfirmation) {
        return res.status(403).json({
            error: {
                error_ar: 'كلمه السر مطلوبه.',
                error_en: 'Passwords are required.'
            }
        });
    }

    if (newPassword !== passwordConfirmation) {
        return res.status(403).json({
            error: {
                error_en: 'Passwords do not match.',
                error_ar: 'كلمه السر غير صحيحه',
            }
        })
    }

    const firebase = await admin.auth().verifyIdToken(idToken)

    let getUser = await db.users.findFirst({
        where: {
            phone: firebase.phone_number
        }
    })

    if (!getUser) {
        return res.status(403).send('Something went wrong, Unknown Token')
    }

    await db.users.update({
        where: {
            id: getUser.id 
        },
        data: {
            password: hash.hashSync(newPassword, 10)
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم استعاده كلمه السر.',
            success_en: 'Password has been updated.'
        }
    });

}

module.exports = {register, login, changePassword, resetPassword, forgetPassword}