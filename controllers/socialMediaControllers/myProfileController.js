const express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Get my own profile */
let getMyProfile = async (req, res) => {
    return res.status(200).json(req.user)
}

/* Get friends list */
let getMyFriends = async (req, res) => {
    let { page } = req.query
    if (! page) page = 1;
    let maxAds = 20;
    let getFriendsList = await db.friends.findMany({
        where: {
            user_id: req.user.id
        },
        orderBy: {
            updated_at: 'desc'
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
        include: {
            user: true
        }
    })

    return res.status(200).json(getFriendsList)
}

/*  Get My Posts */
let getMyPosts = async (req, res) => {
    let { page } = req.query
    if (! page) page = 1;
    let maxAds = 15;
    let newPosts = [];
    let getMyPosts = await db.posts.findMany({
        where: {
            user_id: req.user.id
        },
        orderBy: {
            created_at: 'desc'
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
        include: {
            attachments: true,
        }
    });    

    for (item of getMyPosts) {
        item.feeling = await db.postFeelings.findFirst({
            where: {
                id: item.feeling_id
            }
        })

        item.activity = await db.postActivity.findFirst({
            where: {
                id: item.activity_id
            }
        })
        newPosts.push(item)
    }
    return res.status(200).json(newPosts)
}

/* get My Followers */
let getMyFollowers = async (req, res) => {
    let { page } = req.query
    if (! page) page = 1;
    let maxAds = 20;
    let getFollowersList = await db.followers.findMany({
        where: {
            user_id: req.user.id
        },
        orderBy: {
            updated_at: 'desc'
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
        include: {
            user: true
        }
    })

    return res.status(200).json(getFollowersList)
}

/* Get My blocked users */
let getMyBlockedUsers = async (req, res) => {
    let { page } = req.query
    if (! page) page = 1;
    let maxAds = 20;
    let getBlockedList = await db.socialBlockedUsers.findMany({
        where: {
            user_id: req.user.id
        },
        orderBy: {
            updated_at: 'desc'
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
        include: {
            user: true
        }
    })

    return res.status(200).json(getBlockedList)
}

/* Create a new post according to the giving informaiton */
let createPost = async (req, res) => {
    const { title, attachments , feeling, activity, location, lng, lat, type } = req.body

    if (feeling) {
        let check = await db.postFeelings.findFirst({ where: { id: feeling } })
        if (! check) checkfeeling = 0
    } 

    if (activity) {
        let check = await db.postActivity.findFirst({ where: { id: feeling } })
        if (! check) checkactivity = 0        
    }

    try {
        let createPost = await db.posts.create({
            data: {
                post_content: title ?? '',
                user_id: req.user.id,
                total_comments: 0,
                total_reactions: 0,
                feeling_id: feeling != null ? parseInt(feeling) : 0,
                activity_id: activity != null ? parseInt(activity) : 0,
                location: location ?? '',
                lat: lat ?? '',
                lng: lng ?? '',
                type: parseInt(type) ?? 0
            }
        })

        // let attachments = [
        //     {
        //         "fieldname": "attachments",
        //         "originalname": "garden-logo.png",
        //         "encoding": "7bit",
        //         "mimetype": "image/png",
        //         "destination": "./uploads/",
        //         "filename": "1651770586234---garden-logo.png",
        //         "path": "uploads/1651770586234---garden-logo.png",
        //         "size": 17673
        //     },
        //     {
        //         "fieldname": "attachments",
        //         "originalname": "download.png",
        //         "encoding": "7bit",
        //         "mimetype": "image/png",
        //         "destination": "./uploads/",
        //         "filename": "1651770586234---download.png",
        //         "path": "uploads/1651770586234---download.png",
        //         "size": 2959
        //     }
        // ]

        // check if attachments exists 
        if (attachments) {
            for (item of attachments) {
                await db.postAttachments.create({
                    data: {
                        post_id: createPost.id,
                        url: item.filename,
                        type: parseInt(type)
                    }
                })
            }
        }

        return res.status(200).json({
            success: {
                succes_en: 'Your post has been submitted.',
                success_ar: 'تم نشر منشورك.'
            }
        })
    } catch (e) {
        console.log(e)
        return;
    } 
}

// Edit on my own post 
let editPost = async (req, res) => {
    const { title, type, postId } = req.body

    try {
        await db.posts.update({
            where: {
                id: parseInt(postId)
            },
            data: {
                title: title ?? ''
            }
        })
        return res.status(200).json({
            success: {
                success_en: 'Your posts has been edited successfully.',
                success_ar: 'تم تعديل منشورك بنجاح.'
            } 
        })
    } catch(e) {
        console.log(e)
        return;
    }
}

module.exports = { getMyProfile, getMyFriends, getMyFollowers, getMyPosts, getMyBlockedUsers, createPost, editPost }