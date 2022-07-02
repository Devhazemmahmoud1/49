const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/*  Getting other users profile and check privacy and settings from thier own side  */
let userProfile = async (req, res) => {
    const { id } = req.params
    if (!id) return;

    // get user information 
    let user = await db.users.findFirst({
        where: {
            id: parseInt(id)
        },
        include: {
            userSettings: true,
            userPrivacy: true,
        }
    })

    if (!user) return res.status(403).send('user not found')

    let total_friends = await db.friends.aggregate({
        where: {
            user_id: parseInt(id)
        },
        _count: {
            id: true,
        }
    })

    let total_followers = await db.followers.aggregate({
        where: {
            follower_id: parseInt(id)
        },
        _count: {
            id: true,
        }
    })
    let total_following = await db.followers.aggregate({
        where: {
            user_id: parseInt(id)
        },
        _count: {
            id: true,
        }
    })
    let total_posts = await db.posts.aggregate({
        where: {
            user_id: parseInt(id)
        },
        _count: {
            id: true,
        }
    })

    delete user.password
    delete user.fcm
    delete user.device_id

    user.total_friends = total_friends
    user.total_following = total_following
    user.total_followers = total_followers
    user.total_posts = total_posts

    let checkIfFriend = await db.friends.findFirst({
        where: {
            user_id: req.user.id,
            friend_id: parseInt(id)
        }
    })

    let checkIffollower = await db.followers.findFirst({
        where: {
            user_id: req.user.id,
            follower_id: parseInt(id)
        }
    })

    let checkIfFriendRequestSent = await db.friendRequests.findFirst({
        where: {
            user_id: req.user.id,
            friendRequestTo: parseInt(id)
        }
    })

    user.isFriend = checkIfFriend ? true : false
    user.isFollower = checkIffollower ? true : false
    user.friendRequestSent = checkIfFriendRequestSent ? true : false
    return res.status(200).json(user)
}

/*  Get friends list */
let getUserFriends = async (req, res) => {
    let { id } = req.params
    let { page } = req.query
    if (!page) page = 1;
    let maxAds = 20;
    let getFriendsList = await db.friends.findMany({
        where: {
            user_id: parseInt(id)
        },
        orderBy: {
            updated_at: 'desc'
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
        include: {
            user: true,
        }
    })

    return res.status(200).json(getFriendsList)
}

/*  Get user's Posts */
let getUserPosts = async (req, res) => {
    let { id } = req.params
    let { page } = req.query
    if (!page) page = 1;
    let maxAds = 15;
    let newPosts = [];
    let getMyPosts = await db.posts.findMany({
        where: {
            user_id: parseInt(id)
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

        if (item.privacy <= 0) continue;

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

        item.userInfo = await db.users.findFirst({
            where: {
                id: parseInt(item.user_id)
            }
        })

        // get reacted or not.
        item.isReacted = (await db.reactions.findFirst({
            where: {
                post_id: parseInt(item.id),
                comment_id: 0,
                user_id: req.user.id
            },
            select: {
                type: true
            }
        })) 

        newPosts.push(item)
    }
    return res.status(200).json(newPosts)
}

/* get My Followers */
let getUserFollowers = async (req, res) => {
    let { id } = req.params
    let { page } = req.query
    if (!page) page = 1;
    let maxAds = 20;
    let getFollowersList = await db.followers.findMany({
        where: {
            follower_id: parseInt(id)
        },
        orderBy: {
            updated_at: 'desc'
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
    })

    for (item of getFollowersList) {
        let user = await db.users.findFirst({
            where: {
                id: item.user_id
            }
        })
        item.user = user
    }

    return res.json(getFollowersList)
}

/* Get a specific post according to the giving informaiton */
let getPost = async (req, res) => {
    const { id } = req.params

    if (!id) return res.stauts(403).json({
        error: {
            error_en: 'Post id is not found',
            error_ar: 'Post id is not found'
        }
    });

    // check post id
    let checkPostInfo = await db.posts.findFirst({
        where: {
            id: parseInt(id)
        },
        include: {
            attachments: true
        }
    })

    if (!checkPostInfo) return false;

    // get reacted or not.
    if (req.user.id) {
        checkPostInfo.isReacted = await db.reactions.findFirst({
            where: {
                post_id: parseInt(id),
                comment_id: 0,
                user_id: req.user.id
            }
        }) 
        checkPostInfo.userInfo = await db.users.findFirst({
            where: {
                id: checkPostInfo.user_id
            }
        })
    } else {
        checkPostInfo.isReacted = null
        checkPostInfo.userInfo = null
    } 

    checkPostInfo.activity = await db.postActivity.findFirst({
        where: {
            id: checkPostInfo.activity_id
        }
    })

    checkPostInfo.feeling = await db.postFeelings.findFirst({
        where: {
            id: checkPostInfo.feeling_id
        }
    })

    return res.status(200).json(checkPostInfo)

}

let getUserGalary = async (req, res) => {
    const { id } = req.params
    let { page } = req.query

    if (!page) page = 1;

    if (! id) {
        return res.status(403).send('user id must be provided')
    }

    let maxAds = 20;

    let getUserPeerGallery = await db.gallary.findMany({
        where: {
            user_id: parseInt(id)
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
    })

    return res.json(getUserPeerGallery)

}

let getUserPeerReels = async (req, res) => {
    const { id } = req.params
    let { page } = req.query
    if (!page) page = 1;

    if (! id) {
        return res.status(403).send('user id must be provided')
    }

    let maxAds = 20; 

    let getUserPeerReals = await db.reels.findMany({
        where: {
            user_id: parseInt(id),
            type: 1
        },
        skip: page == 1 ? 0 : (page * maxAds) - maxAds,
        take: maxAds,
    })

    return res.json(getUserPeerReals)
}

module.exports = { userProfile, getUserFriends, getUserFollowers, getUserPosts, getPost, getUserGalary, getUserPeerReels }