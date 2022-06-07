const { PrismaClient } = require('@prisma/client');
const { sendNotification } = require('../notificationsController/SocialNotification.js');
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

    } catch (e) {
        console.log(e);
        return;
    }

    // Notification is required
    if (req.user.id != checkPostId.user_id) {
        let notify = {
            notification_ar: '' + req.user.firstName + ' ' + req.user.lastName + ' قام بالتعليق علي منشورك.',
            notification_en: '' + req.user.firstName + ' ' + req.user.lastName + ' has commented on your post.',
            sender: req.user.id,
            reciever: checkPostId.user_id,
            postId: postId,
            type: 1,
        }

        sendNotification(notify, req.user);
    }

    return res.status(200).send('ok')
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

    let checkIfTheOtherUserSentFriendReq = await db.friendRequests.findFirst({
        where: {
            user_id: parseInt(friendId),
            friendRequestTo: req.user.id
        }
    })

    if (checkIfTheOtherUserSentFriendReq) {
        await db.friends.create({
            data: {
                user_id: req.user.id,
                friend_id: parseInt(friendId)
            }
        })
        await db.friends.create({
            data: {
                user_id: parseInt(friendId),
                friend_id: req.user.id
            }
        })

        await db.friendRequests.delete({
            where: {
                id: parseInt(checkIfTheOtherUserSentFriendReq.id)
            }
        })

        return res.status(200).json({
            success: {
                success_en: 'You are now friends',
                success_en: 'انتم الان اصدقا'
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

    // Notification is required
    if (req.user.id != parseInt(friendId)) {
        let notify = {
            notification_ar: '' + req.user.firstName + ' ' + req.user.lastName + ' قام بارسال طلب صداقه.',
            notification_en: '' + req.user.firstName + ' ' + req.user.lastName + ' has sent you a friend request.',
            sender: req.user.id,
            reciever: parseInt(friendId),
            postId: null,
            type: 2,
        }

        sendNotification(notify, req.user);
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
    const { requestedFriendId } = req.body
    if (!requestedFriendId) return res.status(200).json({
        error: {
            error_ar: 'خطا.',
            error_en: 'User is not a friend'
        }
    });

    try {
        let getRequestId = await db.friendRequests.findFirst({ where: { user_id: req.user.id, friendRequestTo: parseInt(requestedFriendId) } });
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
    const { requestedFriendId } = req.body

    if (!requestedFriendId) return false;

    try {
        let getRequestId = await db.friendRequests.findFirst({ where: { user_id: parseInt(requestedFriendId), friendRequestTo: req.user.id } });
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

    let checkIfTheyAreFriends2 = await db.friends.findFirst({
        where: {
            user_id: parseInt(checkUser.id),
            friend_id: req.user.id
        }
    })

    if (!checkIfTheyAreFriends) {
        return res.status(403).json({
            error: {
                error_en: 'You are not a friend with ' + checkUser.firstName,
                error_ar: 'انت لست صديق مع' + checkUser.firstName,
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

        await db.friends.delete({
            where: {
                id: checkIfTheyAreFriends2.id
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    return res.status(200).json({
        success: {
            success_ar: checkUser.firstName + ' تم حذفه من الاصدقا',
            success_en: checkUser.firstName + ' has been removed from your friend list.'
        }
    })
}

/* make a follow to a specifc user */
let makeFollow = async (req, res) => {
    const { userId } = req.body

    if (!userId) return;

    let checkUser = await db.users.findFirst({ where: { id: parseInt(userId) } })

    if (!checkUser) {
        return res.status(403).json({
            error: {
                error_ar: 'المستخدم غير موجود.',
                error_en: 'User not found.'
            }
        })
    }

    // check if already followed before

    let checkFollow = await db.followers.findFirst({
        where: {
            user_id: req.user.id,
            follower_id: parseInt(userId)
        }
    })

    if (checkFollow) {
        return res.status(403).json({
            error: {
                error_ar: 'انت بالفعل متابع لهذا المستخدم.',
                error_en: 'You have already followed this user.'
            }
        })
    }

    try {
        await db.followers.create({
            data: {
                user_id: req.user.id,
                follower_id: parseInt(userId)
            }
        })
    } catch (e) {
        console.log(e)
        return false;
    }

    // Notification is required
    let notify = {
        notification_ar: '' + req.user.firstName + ' ' + req.user.lastName + ' قام بمتابعتك.',
        notification_en: '' + req.user.firstName + ' ' + req.user.lastName + ' has followed you',
        sender: req.user.id,
        reciever: parseInt(userId),
        postId: null,
        type: 3,
    }

    sendNotification(notify, req.user);

    return res.status(200).json({
        success: {
            success_en: 'You have followed this user.',
            success_ar: 'انت الان متابع.'
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

    if (!checkIfTheyAreFollowers) {
        return res.status(403).json({
            error: {
                error_en: 'You are not a follower with ' + checkUser.firstName,
                error_ar: 'انت لست متابع ل ' + checkUser.firstName
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

    if (!checkIfBlocked) {
        return res.status(403).json({
            error: {
                error_en: 'This user is not blocked.',
                error_ar: 'هذا المستخدم ليس محظور.'
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
            success_ar: checkUser.firstName + ' تم حذفه من قايمه الحظر',
            success_en: checkUser.firstName + ' has been removed from your block list.'
        }
    })
}

/* add a Friend according to the giving information */
let acceptFriendRequest = async (req, res) => {
    const { friendId } = req.body

    if (!friendId) return;

    let checkIsFriend = await db.friends.findFirst({
        where: {
            user_id: req.user.id,
            friend_id: parseInt(friendId)
        }
    })

    if (checkIsFriend) {
        return res.status(403).json({
            error: {
                error_ar: 'انت بالفعل صديق للمستخدم المختار.',
                error_en: 'You are already a friend with the selected user.'
            }
        })
    }

    try {
        await db.friends.create({
            data: {
                user_id: req.user.id,
                friend_id: parseInt(friendId)
            }
        })
        await db.friends.create({
            data: {
                user_id: parseInt(friendId),
                friend_id: req.user.id
            }
        })

        let checkuser = await db.friendRequests.findFirst({
            where: {
                user_id: parseInt(friendId),
                friendRequestTo: req.user.id
            }
        })

        if (checkuser) {
            await db.friendRequests.delete({
                where: {
                    id: parseInt(checkuser.id)
                }
            })
        } else {
            let checkAnotherUser = await db.friendRequests.findFirst({
                where: {
                    user_id: parseInt(friendId),
                    friendRequestTo: req.user.id
                }
            })

            if (checkAnotherUser) {
                await db.friendRequests.delete({
                    where: {
                        id: checkAnotherUser.id
                    }
                })
            }
        }
    } catch (e) {
        console.log(e);
        return false;
    }

    // Notification is required
    let notify = {
        notification_ar: '' + req.user.firstName + ' ' + req.user.lastName + ' قام بقبول طلب الصداقه.',
        notification_en: '' + req.user.firstName + ' ' + req.user.lastName + ' has accepted your friend request.',
        sender: req.user.id,
        reciever: parseInt(checkuser.id),
        postId: req.user.id,
        type: 4,
    }

    sendNotification(notify, req.user);

    return res.status(200).json({
        success: {
            success_ar: 'تم تاكيد اضافه الصديق المختار.',
            success_en: 'You are now friends.'
        }
    })

}

/* Make block to user */
let makeBlock = async (req, res) => {
    const { userId } = req.body

    if (!userId) return false;
    let checkUser = await db.users.findFirst({ where: { id: parseInt(userId) } })

    if (!checkUser) {
        return res.status(403).json({
            error: {
                error_ar: 'المستخدم غير موجود',
                error_en: 'User not found.'
            }
        })
    }

    // op 1 
    let getFirstUser = await db.friends.findFirst({
        where: {
            user_id: req.user.id,
            friend_id: parseInt(userId)
        }
    })

    // op 2

    let getSecUser = await db.friends.findFirst({
        where: {
            user_id: parseInt(userId),
            friend_id: req.user.id
        }
    })

    if (getSecUser && getFirstUser) {
        let blockProccess1 = await db.friends.delete({
            where: {
                id: getFirstUser.id
            }
        })

        let blockProccess2 = await db.friends.delete({
            where: {
                id: getSecUser.id
            }
        })

        if (!blockProccess1 || !blockProccess2) {
            return res.status(400).send('something went wrong');
        }

    }

    await db.socialBlockedUsers.create({
        data: {
            user_id: req.user.id,
            blocked_user: parseInt(userId)
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم حظر هذا المستخدم.',
            success_en: 'User has been blocked.'
        }
    })
}

/* remove a comment */
let removeComment = async (req, res) => {
    const { commentId } = req.body

    if (!commentId) {
        return res.status(403).send('comment id is not vaild');
    }

    let checkCommentId = await db.comments.findFirst({
        where: {
            id: parseInt(commentId)
        }
    })

    if (!checkCommentId) {
        return res.status(403).send('comment id is not vaild');
    }

    // deleting proccess

    try {
        await db.comments.delete({
            where: {
                id: parseInt(commentId)
            }
        })
    } catch (e) {
        console.log(e);
        return false;
    }

    // Deleting notification is required 

    return res.status(200).json({
        success: {
            success_ar: 'تم حذف التعليق.',
            success_en: 'Comment has been deletd.'
        }
    })
}

/* Add a saraha content */
let addSaraha = async (req, res) => {
    const { content, userId } = req.body

    if (!content || !userId) return res.status(403).send('comment and user id are required')

    let checkUserId = await db.users.findFirst({ where: { id: parseInt(userId) } })

    if (!checkUserId) return res.status(403).json({
        error: {
            error_ar: 'المستخدم غير موجود.',
            error_en: 'User not found'
        }
    })

    try {
        await db.saraha.create({
            data: {
                user_id: req.user.id,
                sentTo: parseInt(userId),
                message: content,
                picturesRate: 0,
                postsRate: 0,
                engagment: 0,
                totalRate: 0
            }
        })
    } catch (e) {
        console.log(e)
        return false;
    }

    // Notification is required
    let notify = {
        notification_ar: 'احدهم قام بارسال رساله لك.',
        notification_en: 'A message has been sent from Annomance user',
        sender: req.user.id,
        reciever: parseInt(userId),
        postId: 0,
        type: 5,
    }

    sendNotification(notify, req.user);

    return res.status(200).json({
        success: {
            success_ar: 'تم ارسال رسالتك بنجاح.',
            success_en: 'Your message has been sent successfully',
        }
    })
}

/*  Search for users / posts  */
let searchForResult = async (req, res) => {
    let { people, posts, search } = req.query

    if (!people || !posts) {
        people = 1;
        posts = 1;
    }

    let maxAds = 20;

    let getPeople = await db.users.findMany({
        where: {
            OR: [
                {
                    firstName: {
                        contains: search
                    }
                },
                {
                    email: {
                        contains: search
                    }
                },
                {
                    phone: {
                        contains: search
                    }
                }
            ]
        },
        skip: people == 1 ? 0 : (people * maxAds) - maxAds,
        take: maxAds,
    })

    let getPosts = await db.posts.findMany({
        where: {
            post_content: {
                contains: search
            }
        },
        include: {
            attachments: true,
        }
    })

    for (item of getPosts) {
        item.activity = await db.postActivity.findFirst({
            where: {
                id: item.activity_id
            }
        })

        item.feeling = await db.postFeelings.findFirst({
            where: {
                id: item.feeling_id
            }
        })

        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
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
                type: true,
            }
        }))
    }

    return res.status(200).json({
        people: getPeople,
        posts: getPosts
    })
}

/* Update the privacy of a specific post */
let updatePostPrivacy = async (req, res) => {
    const { postId, privacy } = req.body

    if (!postId || !privacy) {
        return res.status(403).send('Post id and privacy type id are required');
    }

    // check if post id is correct
    let check = await db.posts.findFirst({
        where: {
            id: parseInt(postId),
            user_id: req.user.id
        }
    })

    if (!check) {
        return res.status(403).send('post id is not correct or you are not the owner of the post');
    }

    let updatePrivacy = await db.posts.update({
        where: {
            id: parseInt(postId),
        },
        data: {
            privacy: parseInt(privacy)
        }
    })

    if (updatePrivacy) {
        return res.status(200).json({
            success: {
                success_en: "Post privacy has been changed.",
                success_ar: "تم تعديل خصوصيه المنشور"
            }
        })
    }

    return false;
}

// hide a specifc post according to the giving information
let hidePost = async (req, res) => {
    const { postId } = req.body

    if (!postId) {
        return res.status(403).send('Post id is missing');
    }

    let postCheck = await db.posts.findFirst({ where: { id: parseInt(postId) } })

    if (!postCheck) return res.status(403).send('Something went wrong');

    let checkIfHiddenBefore = await db.postsPrivacy.findFirst({
        where: {
            post_id: parseInt(postId),
            user_id: req.user.id,
        }
    })

    if (checkIfHiddenBefore) {
        return res.status(403).json({
            error: {
                error_ar: 'تم بالفعل اخفا هذا المنشور.',
                error_en: 'Post has been already marked as hidden.'
            }
        })
    }

    await db.postsPrivacy.create({
        data: {
            user_id: req.user.id,
            post_id: parseInt(postId)
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم اخفا المنشور.',
            success_en: 'Post is hidden.'
        }
    })
}

let reportUser = async (req, res) => {
    const { reportedUserId, message, reason } = req.body

    if (!reportedUserId) return res.status(403).send('user id is required');

    // check on user 
    let reportedUserCheck = await db.users.findFirst({
        where: {
            id: parseInt(reportedUserId)
        }
    })

    if (!reportedUserCheck) {
        return res.status(403).json({
            error: {
                error_en: 'User not found.',
                error_ar: 'المستخدم غير موجود.'
            }
        })
    }

    await db.reports.create({
        data: {
            user_id: req.user.id,
            reported_user: parseInt(reportedUserId),
            message: message ?? undefined,
            reason: reason ?? undefined
        }
    })

    return res.status(200).json({
        success: {
            success_en: 'You have reported this user.',
            success_ar: 'لقد قمت بالابلاغ عن هذا المستخدم.'
        }
    })
}

let makeLikeOnPost = async (req, res) => {
    const { postId, reaction } = req.body

    if (!postId || !reaction) {
        return res.status(403).json({
            error: {
                error_ar: 'رقم المنشور و نوع ال',
                error_en: 'Post id and reaction type are required.'
            }
        })
    }

    try {

        // check if reacted before

        let checkIfLiked = await db.reactions.findFirst({
            where: {
                user_id: req.user.id,
                post_id: parseInt(postId),
            }
        })

        if (checkIfLiked) {

            let previousReaction = checkIfLiked.type

            // get the actual previous reaction 
            await db.reactions.update({
                where: {
                    id: checkIfLiked.id
                },
                data: {
                    type: parseInt(reaction)
                }
            })

            await db.posts.update({
                where: {
                    id: parseInt(postId)
                },
                data: {
                    totalLikes: reaction == previousReaction ? (getReactionsForPost.totalLikes - 1) : undefined,
                    totalLove: reaction == previousReaction ? (getReactionsForPost.totalLove - 1) : undefined,
                    totalWoW: reaction == previousReaction ? (getReactionsForPost.totalWoW - 1) : undefined,
                    totalSad: reaction == previousReaction ? (getReactionsForPost.totalSad - 1) : undefined,
                    totalAngry: reaction == previousReaction ? (getReactionsForPost.totalAngry - 1) : undefined,
                }
            })

            await db.posts.update({
                where: {
                    id: parseInt(postId)
                },
                data: {
                    totalLikes: reaction == 1 && previousReaction != reaction ? (getReactionsForPost.totalLikes + 1) : undefined,
                    totalLove: reaction == 2 && previousReaction != reaction ? (getReactionsForPost.totalLove + 1) : undefined,
                    totalWoW: reaction == 3 && previousReaction != reaction ? (getReactionsForPost.totalWoW + 1) : undefined,
                    totalSad: reaction == 4 && previousReaction != reaction ? (getReactionsForPost.totalSad + 1) : undefined,
                    totalAngry: reaction == 5 && previousReaction != reaction ? (getReactionsForPost.totalAngry + 1) : undefined,
                }
            })

            return res.status(200).send('ok')
        }

        let createReation = await db.reactions.create({
            data: {
                user_id: req.user.id,
                post_id: parseInt(postId),
                comment_id: 0,
                type: parseInt(reaction)
            }
        })

        if (!createReation) return res.status(403).send('something went wrong ' + createReation)

        var getReactionsForPost = await db.posts.findFirst({
            where: {
                id: parseInt(postId)
            }
        })

        let updateReactionForPost = await db.posts.update({
            where: {
                id: parseInt(postId)
            },
            data: {
                totalLikes: reaction == 1 ? (getReactionsForPost.totalLikes + 1) : undefined,
                totalLove: reaction == 2 ? (getReactionsForPost.totalLove + 1) : undefined,
                totalWoW: reaction == 3 ? (getReactionsForPost.totalWoW + 1) : undefined,
                totalSad: reaction == 4 ? (getReactionsForPost.totalSad + 1) : undefined,
                totalAngry: reaction == 5 ? (getReactionsForPost.totalAngry + 1) : undefined,
                total_reactions: (parseInt(getReactionsForPost.total_reactions) + 1)
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    let notify = {
        notification_ar: '' + req.user.firstName + ' ' + req.user.lastName + ' قام بالاعجاب علي منشورك',
        notification_en: '' + req.user.firstName + ' ' + req.user.lastName + ' has liked your post',
        sender: req.user.id,
        reciever: parseInt(getReactionsForPost.user_id),
        postId: parseInt(postId),
        type: 1,
    }

    sendNotification(notify, req.user);

    return res.status(200).json({
        success: {
            success_ar: 'You have liked a post.',
            success_en: 'لقد قمت بالاعجاب علي هذا المنشور.'
        }
    })
}

// Make unlike a specific post
let makeUnlikeOnPost = async (req, res) => {
    const { postId } = req.body

    if (!postId) {
        return res.status(403).json({
            error: {
                error_ar: 'رقم المنشور و نوع ال',
                error_en: 'Post id and reaction type are required.'
            }
        })
    }

    try {

        let getPostReaction = await db.reactions.findFirst({
            where: {
                user_id: req.user.id,
                post_id: parseInt(postId),
            }
        })

        if (!getPostReaction) return res.status(403).send('something went wrong')

        let deleteReaction = await db.reactions.delete({
            where: {
                id: getPostReaction.id
            }
        })

        if (!deleteReaction) return res.status(403).send('something went wrong')

        let getReactionsForPost = await db.posts.findFirst({
            where: {
                id: parseInt(postId)
            }
        })

        let updateReactionForPost = await db.posts.update({
            where: {
                id: parseInt(postId)
            },
            data: {
                totalLikes: reaction == 1 && parseInt(getReactionsForPost.totalLikes) >= 0 ? (getReactionsForPost.totalLikes - 1) : undefined,
                totalLove: reaction == 2 && parseInt(getReactionsForPost.totalLove) >= 0 ? (getReactionsForPost.totalLove - 1) : undefined,
                totalWoW: reaction == 3 && parseInt(getReactionsForPost.totalWoW) >= 0 ? (getReactionsForPost.totalWoW - 1) : undefined,
                totalSad: reaction == 4 && parseInt(getReactionsForPost.totalSad) >= 0 ? (getReactionsForPost.totalSad - 1) : undefined,
                totalAngry: reaction == 5 && parseInt(getReactionsForPost.totalAngry) >= 0 ? (getReactionsForPost.totalAngry - 1) : undefined,
                total_reactions: getReactionsForPost.total_reactions >= 0 ? getReactionsForPost.total_reactions - 1 : 0
            }
        })

        let deleteNotification = await db.notifications.findFirst({
            where: {
                sender_id: req.user.id,
                direction: parseInt(postId),
                type: 1
            }
        })

        await db.notifications.delete({
            where: {
                id: deleteNotification.id
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }



    return res.status(200).json({
        success: {
            success_ar: 'ok',
            success_en: 'ok'
        }
    })
}

// like on comments
let makeLikeOnComment = async (req, res) => {
    const { postId, commentId, reaction } = req.body

    if (!postId || !reaction || !commentId) {
        return res.status(403).json({
            error: {
                error_ar: 'رقم المنشور و نوع ال',
                error_en: 'Post id and reaction type are required.'
            }
        })
    }

    try {

        let checkIfLiked = await db.reactions.findFirst({
            where: {
                user_id: req.user.id,
                post_id: parseInt(postId),
                comment_id: parseInt(commentId),
                type: parseInt(reaction),
            }
        })

        if (checkIfLiked) return res.status(403).send('Something went wrong');

        let createReation = await db.reactions.create({
            data: {
                user_id: req.user.id,
                post_id: parseInt(postId),
                comment_id: parseInt(commentId),
                type: parseInt(reaction)
            }
        })

        if (!createReation) return res.status(403).send('something went wrong')

        var getReactionsForPost = await db.comments.findFirst({
            where: {
                id: parseInt(commentId),
            }
        });

        let getRecentReactions = await db.comments.findFirst({
            where: {
                id: parseInt(commentId)
            }
        })

        let updateReactionForPost = await db.comments.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                totalLikes: reaction == 1 ? (getReactionsForPost.totalLikes + 1) : undefined,
                totalLove: reaction == 2 ? (getReactionsForPost.totalLove + 1) : undefined,
                totalWoW: reaction == 3 ? (getReactionsForPost.totalWoW + 1) : undefined,
                totalSad: reaction == 4 ? (getReactionsForPost.totalSad + 1) : undefined,
                totalAngry: reaction == 5 ? (getReactionsForPost.totalAngry + 1) : undefined,
                total_reactions: getRecentReactions.total_reactions + 1
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    let notify = {
        notification_ar: '' + req.user.firstName + ' ' + req.user.lastName + ' قام بالاعجاب علي تعليقك',
        notification_en: '' + req.user.firstName + ' ' + req.user.lastName + ' has liked your comment',
        sender: req.user.id,
        reciever: parseInt(getReactionsForPost.user_id),
        postId: parseInt(postId),
        type: 1,
    }

    sendNotification(notify, req.user);

    return res.status(200).json({
        success: {
            success_ar: 'You have liked this comment.',
            success_en: 'لقد قمت بالاعجاب علي هذا التعليق.'
        }
    })
}

// unlike on comment
let makeUnlikeOnComment = async (req, res) => {
    const { postId, commentId, reaction } = req.body

    if (!postId || !reaction || !commentId) {
        return res.status(403).json({
            error: {
                error_ar: 'رقم المنشور و نوع ال',
                error_en: 'Post id and reaction type are required.'
            }
        })
    }

    try {

        let checkIfLiked = await db.reactions.findFirst({
            where: {
                user_id: req.user.id,
                post_id: parseInt(postId),
                comment_id: parseInt(commentId),
                type: parseInt(reaction),
            }
        })

        if (!checkIfLiked) return res.status(403).send('Something went wrong');

        let createReation = await db.reactions.delete({
            where: {
                id: parseInt(checkIfLiked.id)
            }
        })

        if (!createReation) return res.status(403).send('something went wrong')

        let getRecentReactions = await db.comments.findFirst({
            where: {
                id: parseInt(commentId)
            }
        })

        let updateReactionForPost = await db.comments.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                totalLikes: reaction == 1 ? (getRecentReactions.totalLikes - 1) : undefined,
                totalLove: reaction == 2 ? (getRecentReactions.totalLove - 1) : undefined,
                totalWoW: reaction == 3 ? (getRecentReactions.totalWoW - 1) : undefined,
                totalSad: reaction == 4 ? (getRecentReactions.totalSad - 1) : undefined,
                totalAngry: reaction == 5 ? (getRecentReactions.totalAngry - 1) : undefined,
                total_reactions: getRecentReactions.total_reactions - 1
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

    let deleteNotification = await db.notifications.findFirst({
        where: {
            sender_id: req.user.id,
            direction: parseInt(postId),
            type: 1
        }
    })

    await db.notifications.delete({
        where: {
            id: deleteNotification.id
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'ok.',
            success_en: 'ok.'
        }
    })
}

module.exports = {
    editComment,
    addNewComment,
    sendFriendRequest,
    UndoFriendRequest,
    removeFriendRequestInMyList,
    unfriendUser,
    unfollowUser,
    unblockUser,
    acceptFriendRequest,
    makeFollow,
    makeBlock,
    removeComment,
    addSaraha,
    searchForResult,
    updatePostPrivacy,
    hidePost,
    reportUser,
    makeLikeOnPost,
    makeUnlikeOnPost,
    makeLikeOnComment,
    makeUnlikeOnComment,
}