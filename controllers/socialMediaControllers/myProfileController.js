const express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Get my own profile */
let getMyProfile = async (req, res) => {
    return res.status(200).json({
        userInfo: req.user, 
        total_friends: await db.friends.aggregate({
            where: {
                user_id: req.user.id
            },
            _count: {
                id: true,
            }
        }),
        total_followers: await db.followers.aggregate({
            where: {
                follower_id: req.user.id
            },
            _count: {
                id: true,
            }
        }),
        total_following: await db.followers.aggregate({
            where: {
                user_id: req.user.id
            },
            _count: {
                id: true,
            }
        }),
        total_posts: await db.posts.aggregate({
            where: {
                user_id: req.user.id
            },
            _count: {
                id: true,
            }            
        })
    })
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

            // get reacted or not.
            item.isReacted = await db.reactions.findFirst({
                where: {
                    post_id: parseInt(item.id),
                    comment_id: 0,
                    user_id: req.user.id
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
            follower_id: req.user.id
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

/* get my friend requests */   
let getFriendRequests = async (req, res) => {
    let { page } = req.query
    if (! page) page = 1;
    let maxAds = 20;
    let getFriendsRequests = await db.friendRequests.findMany({
        where: {
            friendRequestTo: req.user.id
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

    return res.status(200).json(getFriendsRequests)   
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
            users: true
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

    if (! postId) {
        return res.status(403).send('Post id is required');
    }

    let checkPostAuthor = await db.posts.findFirst({
        where: {
            id: Number(postId),
            user_id: req.user.id
        }
    })

    if (! checkPostAuthor) {
        return res.status(403).json({
            error: {
                error_en: 'You are not this post author',
                error_ar: 'انت لست صاحب المنشور'
            }
        })
    }

    try {
        await db.posts.update({
            where: {
                id: parseInt(postId)
            },
            data: {
                post_content: title ?? '',
                type: type ?? undefined
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

// Delete my post
let deletePost = async (req, res) => {
    const { id } = req.body

    if (! id ) return res.stauts(403).send('Post id is required')

    let checkPostId = await db.posts.findFirst({ where: { id: parseInt(id), user_id: req.user.id } })

    if (! checkPostId) return res.status(403).send('Post is not found , Or you are not the author of the post')

    // delete attachments and privacy before deleting the post
    try {

        let deletingPostAttachments = await db.postAttachments.deleteMany({
            where: {
                post_id: parseInt(id)
            }
        })

        if (! deletingPostAttachments) return res.status(403).send('Something went wrong.');

        //let getPostPrivacyId = await db.post

        let deletingPrivacy = await db.postsPrivacy.deleteMany({
            where: {
                post_id: parseInt(id),
            }
        })

        await db.posts.delete({
            where: {
                id: parseInt(id)
            }
        })

    } catch (e) {
        console.log(e);
        return false;
    }

    return res.status(200).json({
        success: {
            success_ar: 'تم مسح المنشور بنجاح',
            success_en: 'Post has been deleted successfully.'
        }
    })
}

// get list of feeling 
let getFeelings = async (req, res) => {
    return res.status(200).json((await db.postFeelings.findMany()))
}

// get list of activities
let getActivities = async (req, res) => {
    return res.status(200).json((await db.postActivity.findMany()))
}

// get Main categories 
let getComments = async (req, res) => {
    const { id } = req.params
    let { page } = req.query

    if (! page ) {
        page = 1
    }

    let maxComments = 20;

    if (! id) {
        return res.status(403).send('post id is required');
    }

    let checkPost = await db.posts.findFirst({ where: { id: parseInt(id) } })

    if (! checkPost) {
        return res.status(403).send('Post is not found');
    }

    let getPostComments = await db.comments.findMany({
        where: {
            post_id: parseInt(id)
        },
        skip: page == 1 ? 0 : (page * maxComments) - maxComments,
        take: maxComments,
    })

    let postsWithUser = [];
    // get user information
    for ( item of getPostComments ) {
        let user = await db.users.findFirst({
            where: {
                id: item.user_id
            }, 
            select: {
                id: true,
                profilePicture: true,
                firstName: true,
                lastName: true,
            }
        })

        item.userInfo = user
        postsWithUser.push(item)
    }

    return res.status(200).json(postsWithUser)

}

// get comment reactions with users
let getCommentReactions = async (req, res) => {
    const { id } = req.params

    if (! id ) return false;

    // check on the comment
    let checkOnComment = await db.comments.findFirst( { where: { id: parseInt(id) } })

    if (! checkOnComment) return false;

    let getCommentReacts = await db.reactions.findMany({
        where: {
            comment_id: parseInt(id)
        }
    }) 

    let finalResult = []

    for (item of getCommentReacts) {
        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
            },
            select: {
                id: true,
                profilePicture: true,
                firstName: true,
                lastName: true,
            }
        })

        finalResult.push(item)
    }

    let totalLikesWithPeople = finalResult.filter( (item) => {
        return item.type == 1
    })

    let totalLoveWithPeople = finalResult.filter( (item) => {
        return item.type == 2
    })
    let totalWowWithPeople = finalResult.filter( (item) => {
        return item.type == 3
    })

    let totalSadWithPeople = finalResult.filter( (item) => {
        return item.type == 4
    })

    let totalAngryWithPeople = finalResult.filter( (item) => {
        return item.type == 5
    })

    return res.status(200).json({
        totalLikes: totalLikesWithPeople,
        totalLove: totalLoveWithPeople,
        totalWow: totalWowWithPeople,
        totalSad: totalSadWithPeople,
        totalAngry: totalAngryWithPeople
    })
}



module.exports = { getMyProfile, getMyFriends, getMyFollowers, getMyPosts, getMyBlockedUsers, createPost, editPost, deletePost, getActivities, getFeelings, getFriendRequests, getComments, getCommentReactions }