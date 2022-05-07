const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

// add a comment to an existing post 
let addNewComment = async (req, res) => {
    const { comment, postId } = req.body

    if (!postId) return false;

    let checkPostId = await db.posts.findFirst({ where: { id: parseInt(postId) } })

    if (!checkPostId) return false;

    try {

        await db.comments.create({
            data: {
                user_id: req.user.id,
                comment_content: comment,
                post_id: parseInt(postId),
                total_reactions: 0,
            }
        })

        return res.status(200).send('ok')

    } catch (e) {
        console.log(e);
        return;
    }
}

// edit on a comment according to the giving informaiton
let editComment = async (req, res) => {
    const { commentId, commentContent } = req.body

    if (! await db.comments.findFirst({ where: { id: parseInt(commentId) } })) return false;

    if ((await db.comments.findFirst({ where: { id: parseInt(commentId) } })).user_id != req.user.id)
        return false;

    try {
        await db.comments.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                comment_content: commentContent ?? ''
            }
        })
    } catch (e) {
        console.log(e);
        return;
    }

    return res.status(200).send('comment editted')
}

// send a friend request
let sendFriendRequest = async (req, res) => {
    const { friendId } = req.body

    if (!friendId) return res.status(403).send('user not found');

    let checkUser = await db.friendRequests.findFirst({
        where: {
            user_id: req.user.id,
            friendRequestTo: parseInt(friendId)
        }
    })

    if (checkUser) {
        return res.status(403).json({
            error: {
                error_en: 'Friend request has been already sent.',
                error_ar: 'تم بالفعل ارسال طلب الصداقه'
            }
        })
    }

    try {
        await db.friendRequests.create({
            data: {
                user_id: req.user.id,
                friendRequestTo: parseInt(friendId)
            }
        });
    } catch (e) {
        console.log(e)
        return false;
    }

    return res.status(200).json({
        success: {
            success_ar: 'تم ارسال طلب الصداقه.',
            success_en: 'Friend request has been sent.'
        }
    })
}

/* remove friend requests from my user side req.user.id => other user */
let UndoFriendRequest = async (req, res) => {
    const { requestId } = req.body
    if (!requestId) return false;
    try {
        let getRequestId = await db.friendRequests.findFirst({ where: { user_id: req.user.id, friendRequestTo: parseInt(requestId) } });
        await db.friendRequests.delete({
            where: {
                id: getRequestId.id
            }
        })
    } catch (e) {
        console.log(e)
        return;
    }

    return res.status(200).json({
        success: {
            success_ar: 'تم حذف طلب الصداقه.',
            success_en: 'Friend request has been removed.'
        }
    })
}

/* removing friend requests from my list */
let removeFriendRequestInMyList = async (req, res) => {
    const { requestId } = req.body

    if (!requestId) return false;

    try {
        let getRequestId = await db.friendRequests.findFirst({ where: { user_id: parseInt(requestId), friendRequestTo: req.user.id } });
        await db.friendRequests.delete({
            where: {
                id: getRequestId.id
            }
        })
    } catch (e) {
        console.log(e)
        return;
    }

    return res.status(200).json({
        success: {
            success_ar: 'تم حذف طلب الصداقه.',
            success_en: 'Friend request has been removed.'
        }
    })
}

/* remove a user from my list */
let unfriendUser = async (req, res) => {
    const { id } = req.body
    if (!id) return false;

    let checkUser = await db.users.findFirst({ where: { id: parseInt(id) } })

    if (!checkUser) {
        return res.status(403).json({
            error: {
                error_ar: 'المستخدم غير موجود',
                error_en: 'User not found.'
            }
        })
    }

    let checkIfTheyAreFriends = await db.friends.findFirst({
        where: {
            user_id: req.user.id,
            friend_id: parseInt(checkUser.id)
        }
    })

    if (!checkIfTheyAreFriends) {
        return res.status(403).json({
            error: {
                error_en: 'You are not a friend with ${checkUser.firstName}',
                error_ar: 'انت لست صديق مع ${ checkUser.firstName }'
            }
        })
    }

    try {

        let getRawFromFriends = await db.friends.findFirst({ where: { user_id: req.user.id, friend_id: parseInt(id) } })

        await db.friends.delete({
            where: {
                id: getRawFromFriends.id
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    return res.status(200).json({
        success: {
            success_ar: '${ checkUser.firstName } تم حذفه من الاصدقا',
            success_en: '${ checkUser.firstName } has been removed from your friend list.' 
        }
    })
}

/* un-follow a user */
let unfollowUser = async (req, res) => {
    const { id } = req.body
    if (!id) return false;

    let checkUser = await db.users.findFirst({ where: { id: parseInt(id) } })

    if (!checkUser) {
        return res.status(403).json({
            error: {
                error_ar: 'المستخدم غير موجود',
                error_en: 'User not found.'
            }
        })
    }

    let checkIfTheyAreFollowers = await db.followers.findFirst({
        where: {
            user_id: req.user.id,
            follower_id: parseInt(checkUser.id)
        }
    })

    if (! checkIfTheyAreFollowers) {
        return res.status(403).json({
            error: {
                error_en: 'You are not a follower with ${checkUser.firstName}',
                error_ar: 'انت لست متابع ل ${ checkUser.firstName }'
            }
        })
    }

    try {

        let getRawFromFriends = await db.followers.findFirst({ where: { user_id: req.user.id, follower_id: parseInt(id) } })

        await db.followers.delete({
            where: {
                id: getRawFromFriends.id
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    return res.status(200).json({
        success: {
            success_ar: '${ checkUser.firstName } تم حذفه من المتابعه',
            success_en: '${ checkUser.firstName } has been removed from your follow list.' 
        }
    })   
}

/* Unblock a specific user  */
let unblockUser = async (req, res) => {
    const { id } = req.body
    if (!id) return false;

    let checkUser = await db.users.findFirst({ where: { id: parseInt(id) } })

    if (!checkUser) {
        return res.status(403).json({
            error: {
                error_ar: 'المستخدم غير موجود',
                error_en: 'User not found.'
            }
        })
    }

    let checkIfBlocked = await db.socialBlockedUsers.findFirst({
        where: {
            user_id: req.user.id,
            blocked_user: parseInt(checkUser.id)
        }
    })

    if (! checkIfTheyAreFollowers) {
        return res.status(403).json({
            error: {
                error_en: 'You are not a follower with ${checkUser.firstName}',
                error_ar: 'انت لست متابع ل ${ checkUser.firstName }'
            }
        })
    }

    try {

        //let getRawFromFriends = await db.socialBlockedUsers.findFirst({ where: { user_id: req.user.id, follower_id: parseInt(id) } })
        await db.socialBlockedUsers.delete({
            where: {
                id: checkIfBlocked.id
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    return res.status(200).json({
        success: {
            success_ar: '${ checkUser.firstName } تم حذفه من قايمه الحظر',
            success_en: '${ checkUser.firstName } has been removed from your block list.' 
        }
    })       
}

/* */

module.exports = { editComment, addNewComment, sendFriendRequest, UndoFriendRequest, removeFriendRequestInMyList, unfriendUser, unfollowUser, unblockUser }