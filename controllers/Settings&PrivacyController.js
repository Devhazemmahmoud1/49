const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment');
const { getTenderFemales } = require('./socialMediaControllers/myProfileController');

/* Edit settings according to the giving information */
let editSettings = async (req, res) => {
    const { firstName,lastName, birthDate, socialStatus, job, city, lang, gender,  email, phone } = req.body

    // update user settings 

    //value => status

    try {
        // get userSetting
        let getUserSetting = await db.userSettings.findMany({
            where: {
                user_id: req.user.id
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        console.log(getUserSetting)

        //getUserSetting.shift();
        //getUserSetting.shift();
        //getUserSetting.shift();

        // update userSettings

        let values = [
            { value: country.value, status: country.status},
            { value: email.value, status: email.status},
            { value: phone.value, status: phone.status},
            { value: birthDate.value, status: birthDate.status},
            { value: socialStatus.value, status: socialStatus.status},
            { value: job.value, status: job.status},
            { value: city.value, status: city.status},
            { value: lang.value, status: lang.status},
            { value: gender.value, status: gender.status}
        ]

        await db.users.update({
            where: {
                id: req.user.id
            }, 
            data: {
                lastName: lastName.value,
                firstName: firstName.value
            }
        })


        console.log(getUserSetting)

        let x = 0;
        for (item of getUserSetting) {

            await db.userSettings.update({
                where: {
                    id: item.id
                },
                data: {
                    value: item.identifier == 8 || item.identifier == 2 || item.identifier == 3 ? undefined : values[x].value,
                    status: values[x].status
                }
            })
            x++;
        }

        return res.status(200).json({
            success: {
                success_ar: 'تم تعديل اعداداتك.',
                success_en: 'Settings has been updated.'
            }
        })

    } catch (e) { console.log(e) }
}

/* This method is used to edit on user's privacy */
let editPrivacy = async (req, res) => {
    const { userPrivacy } = req.body
    if (! userPrivacy) return;

    // get user privacy

    let userPriv = await db.userPrivacy.findMany({ where: {user_id: req.user.id}, orderBy: {created_at: 'asc'} })
    // update user privacy
    try {

        let x = 0;
        for (item of userPriv) {
            await db.userPrivacy.update({
                where: {
                    id: item.id
                },
                data: {
                    status: userPrivacy[x].status
                }
            })
            x++;
        }

        return res.status(200).json({
            success: {
                success_ar: 'تم تعديل خصوصيتك.',
                success_en: 'Your privacy has been updated'
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }
}

/* Getting the settings information according to the guard was giving */
let getSettings = (req, res) => {

}

module.exports = { editSettings, editPrivacy, getSettings }