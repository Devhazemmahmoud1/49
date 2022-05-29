const {PrismaClient} = require('@prisma/client');
const {sendNotification} = require('../notificationsController/SocialNotification.js');
const db = new PrismaClient();

/* delete a  reel */
let deleteReel = async (req, res) => {
    const {id} = req.body

    if (!id) return res.status(403).json({
        error: {
            error_en: 'Reel id is not vaild',
            error_ar: 'Reel id is not valid'
        }
    })

    // check for the giving id in the reels table

    let checkReel = await db.reels.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (!checkReel) {
        return res.status(403).json({
            error: {
                error_en: 'Reel id is not vaild',
                error_ar: 'Reel id is not valid'
            }
        })
    }

    await db.reels.delete({
        where: {
            id: parseInt(id)
        }
    })

    return res.status(200).json({
        success: {
            success_en: 'Reel has been deleted successfully',
            success_ar: 'Reel has been deleted successfully'
        }
    })
}

/* get One reel */
let getOneReel = async (req, res) => {
    const {id} = req.params

    if (!id) {
        return res.status(403).json({
            error_en: 'Reel is not found',
            error_ar: 'reel is not found'
        })
    }

    let checkReel = await db.reels.findFirst({
        where: {
            id: parseInt(id)
        },
        include: {
            song: true,
        }
    })

    if (!checkReel) {
        return res.status(403).json({
            error: {
                error_en: 'Reel id is not vaild',
                error_ar: 'Reel id is not valid'
            }
        })
    }

    checkReel.isFriend = (await db.friends.findFirst({
        where: {
            user_id: req.user.id,
            friend_id: checkReel.user_id
        }
    })) != null

    checkReel.isLiked = (await db.reelLikes.findFirst({
        where: {
            reel_id: checkReel.id,
            user_id: req.user.id
        }
    })) != null


    checkReel.isMine = (await db.reels.findFirst({
        where: {
            id: checkReel.id,
            user_id: req.user.id
        }
    })) != null

    checkReel.userInfo = await db.users.findFirst({
        where: {
            id: checkReel.user_id
        }
    })


    return res.status(200).json(checkReel)
}

let getMyReels = async (req, res) => {
    let {page} = req.query
    if (!page) page = 1;
    let maxReels = 20;
    console.log(1)
    let getMyreelList = await db.reels.findMany({
        where: {
            user_id: req.user.id,
            type: 1
        },
        include: {
            song: true,
        },
        skip: page == 1 ? 0 : (page * maxReels) - maxReels,
        take: maxReels,
    });

    for (item of getMyreelList) {
        item.isFriend = false

        item.isLiked = (await db.reelLikes.findFirst({
            where: {
                reel_id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.isMine = true

        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
            },
            select: {
                profilePicture: true,
                firstName: true,
                lastName: true,
                id: true,
            }
        })
    }

    return res.status(200).json(getMyreelList)
}

let publicReels = async (req, res) => {
    let {page} = req.query
    if (!page) page = 1;
    let maxReels = 20;

    let getMyreelList = await db.reels.findMany({
        where: {
            type: 1
        },
        include: {
            song: true,
        },
        skip: page == 1 ? 0 : (page * maxReels) - maxReels,
        take: maxReels,
    });

    for (item of getMyreelList) {
        if (req.user) {
            item.isFriend = (await db.friends.findFirst({
                where: {
                    user_id: req.user.id,
                    friend_id: item.user_id
                }
            })) != null
        } else {
            item.isFriend = false
        }
        if (req.user) {
            item.isLiked = (await db.reelLikes.findFirst({
                where: {
                    reel_id: item.id,
                    user_id: req.user.id
                }
            })) != null
        } else {
            item.isLiked = false
        }
        if (req.user) {
            item.isMine = (await db.reels.findFirst({
                where: {
                    id: item.id,
                    user_id: req.user.id
                }
            })) != null
        } else {
            item.isMine = false
        }


        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id,

            },
            select: {
                profilePicture: true,
                phone: true,
                firstName: true,
                lastName: true,
                id: true,
                userPrivacy: true,
            }
        })
    }

    return res.status(200).json(getMyreelList)
}

let getSongs = async (req, res) => {
    let songs = await db.songs.findMany({})
    return res.status(200).json(songs.filter((result) => {
        return result.id > 0
    }))
}

let putLikeOnReel = async (req, res) => {
    const {id} = req.body

    if (!id) {
        return res.status(403).json({
            error: {
                error_ar: 'Id is not vaild.',
                error_en: 'id is not vaild'
            }
        })
    }

    let checkOnReel = await db.reels.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (!checkOnReel) {
        return res.status(403).json({
            error: {
                error_ar: 'Id is not vaild.',
                error_en: 'id is not vaild'
            }
        })
    }

    let checkIfReelWasLikedBefore = await db.reelLikes.findFirst({
        where: {
            user_id: req.user.id,
            reel_id: parseInt(id)
        }
    })

    if (checkIfReelWasLikedBefore) {
        return res.status(403).json({
            error: {
                error_ar: 'Add was send before',
                error_en: 'Add was sent before'
            }
        })
    }

    await db.reelLikes.create({
        data: {
            user_id: req.user.id,
            reel_id: parseInt(id)
        }
    })

    await db.reels.update({
        where: {
            id: parseInt(id)
        },
        data: {
            totalLikes: parseInt(checkOnReel.totalLikes) + 1
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'OK',
            success_en: 'ok'
        }
    })
}

/* Increase the view of the reel*/
let addViewToReel = async (req, res) => {
    const {id} = req.body

    if (!id) {
        return res.status(403).json({
            error: {
                error_en: 'Id is not vailed',
                error_ar: 'ID is not vaild'
            }
        })
    }

    let getReel = await db.reels.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (!getReel) {
        return res.status(403).json({
            error: {
                error_en: 'Id is not vailed',
                error_ar: 'ID is not vaild'
            }
        })
    }

    let checkReelIfTrue = await db.reelViews.findFirst({
        where: {
            reel_id: parseInt(id),
            user_id: req.user.id
        }
    })

    if (checkReelIfTrue) {
        return res.status(403).json({
            error: {
                error_ar: 'View was send before',
                error_en: 'View was sent before'
            }
        })
    }

    await db.reelViews.create({
        data: {
            user_id: req.user.id,
            reel_id: parseInt(id)
        }
    })

    await db.reels.update({
        where: {
            id: parseInt(id)
        },
        data: {
            totalViews: parseInt(getReel.totalViews) + 1
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'OK',
            success_en: 'ok'
        }
    })
}

/* DeCrease the view of the reel */
let removeLikeFromReel = async (req, res) => {
    const {id} = req.body

    if (!id) {
        return res.status(403).json({
            error: {
                error_en: 'Id is not vailed',
                error_ar: 'ID is not vaild'
            }
        })
    }

    let getReel = await db.reels.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (!getReel) {
        return res.status(403).json({
            error: {
                error_en: 'Id is not vailed',
                error_ar: 'ID is not vaild'
            }
        })
    }

    let checkReelIfTrue = await db.reelLikes.findFirst({
        where: {
            reel_id: parseInt(id),
            user_id: req.user.id
        }
    })

    if (!checkReelIfTrue) {
        return res.status(403).json({
            error: {
                error_ar: 'View was send before',
                error_en: 'View was sent before'
            }
        })
    }

    await db.reelLikes.delete({
        where: {
            id: checkReelIfTrue.id
        },
    })

    await db.reels.update({
        where: {
            id: parseInt(id)
        },
        data: {
            totalLikes: (parseInt(getReel.totalLikes) - 1)
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'OK',
            success_en: 'ok'
        }
    })
}

/* Get my own Stories */
let getMyStories = async (req, res) => {

    let stories = await db.reels.findMany({
        where: {
            user_id: req.user.id,
            type: 2
        }
    })

    for (item of stories) {
        item.isFriend = false

        item.isLiked = (await db.reelLikes.findFirst({
            where: {
                reel_id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
            }
        })

        item.isMine = true
    }

    return res.status(200).json(stories)
}

/* Get users Stories */
let getUserStories = async (req, res) => {
    const {id} = req.params

    if (!id) {
        return res.status(403).json({
            error: {
                error_en: 'No',
                error_ar: 'No'
            }
        })
    }

    let checkUser = await db.users.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (!checkUser) {
        return res.status(403).json({
            error: {
                error_en: 'No',
                error_ar: 'No'
            }
        })
    }

    let stories = await db.reels.findMany({
        where: {
            user_id: parseInt(id),
            type: 2
        }
    })

    for (item of stories) {
        item.isFriend = (await db.friends.findFirst({
            where: {
                user_id: req.user.id,
                friend_id: item.user_id
            }
        })) != null

        item.isLiked = (await db.reelLikes.findFirst({
            where: {
                reel_id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.isMine = (await db.reels.findFirst({
            where: {
                id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
            },
            select: {
                profilePicture: true,
                firstName: true,
                lastName: true,
                id: true,
            }
        })


    }

    return res.status(200).json(stories)

}

/* Who liked my own reel */
let getLikedPeople = async (req, res) => {
    const {id} = req.params

    let {page} = req.query
    if (!page) page = 1;
    let maxReels = 20;

    if (!id) {
        return res.status(403).json({
            error: {
                error_en: 'No',
                error_ar: 'No'
            }
        })
    }

    let checkReel = await db.reels.findFirst({
        where: {
            id: parseInt(id),
            user_id: req.user.id
        }
    })

    if (!checkReel) {
        return res.status(403).json({
            error: {
                error_en: 'No',
                error_ar: 'No'
            }
        })
    }

    let listOfUsers = await db.reelLikes.findMany({
        where: {
            reel_id: parseInt(id)
        },
        skip: page == 1 ? 0 : (page * maxReels) - maxReels,
        take: maxReels,
    })

    let users = []

    for (item of listOfUsers) {
        if (item.user_id == req.user.id) continue;
        item.isFriend = (await db.friends.findFirst({
            where: {
                user_id: req.user.id,
                friend_id: item.user_id
            }
        })) != null

        item.isLiked = (await db.reelLikes.findFirst({
            where: {
                reel_id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.isMine = (await db.reels.findFirst({
            where: {
                id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
            },
            select: {
                profilePicture: true,
                firstName: true,
                lastName: true,
                id: true,
            }
        })

        users.push(item)
    }

    return res.status(200).json(users)

}

/* Who liked my own reel */
let getViewedPeople = async (req, res) => {

    const {id} = req.params

    let {page} = req.query
    if (!page) page = 1;
    let maxReels = 20;

    if (!id) {
        return res.status(403).json({
            error: {
                error_en: 'No',
                error_ar: 'No'
            }
        })
    }

    let checkReel = await db.reels.findFirst({
        where: {
            id: parseInt(id),
            user_id: req.user.id
        }
    })

    if (!checkReel) {
        return res.status(403).json({
            error: {
                error_en: 'No',
                error_ar: 'No'
            }
        })
    }

    let listOfUsers = (await db.reelViews.findMany({
        where: {
            reel_id: parseInt(id)
        },
        skip: page == 1 ? 0 : (page * maxReels) - maxReels,
        take: maxReels,
    }))

    let users = []

    for (item of listOfUsers) {
        if (item.user_id == req.user.id) continue;
        item.isFriend = (await db.friends.findFirst({
            where: {
                user_id: req.user.id,
                friend_id: item.user_id
            }
        })) != null

        item.isLiked = (await db.reelViews.findFirst({
            where: {
                reel_id: item.id,
                user_id: req.user.id
            }
        })) != null

        item.isMine = (await db.reels.findFirst({
            where: {
                id: item.id,
                user_id: req.user.id
            }
        }))

        item.userInfo = await db.users.findFirst({
            where: {
                id: item.user_id
            },
            select: {
                profilePicture: true,
                firstName: true,
                lastName: true,
                id: true,
            }
        })

        users.push(item)
    }

    return res.status(200).json(users)

}

module.exports = {
    deleteReel,
    getOneReel,
    getMyReels,
    publicReels,
    getSongs,
    putLikeOnReel,
    addViewToReel,
    removeLikeFromReel,
    getMyStories,
    getUserStories,
    getLikedPeople,
    getViewedPeople
}