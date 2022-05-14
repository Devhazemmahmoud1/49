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

    if (! user) return res.status(403).send('user not found')

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
            user: true
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
let getUserFollowers = async (req, res) => {
    let { id } = req.params
    let { page } = req.query

    if (!page) page = 1;
    
    let maxAds = 20;
    let getFollowersList = await db.followers.findMany({
        where: {
            user_id: parseInt(id)
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

module.exports = { userProfile, getUserFriends, getUserFollowers, getUserPosts }