const { PrismaClient } = require('@prisma/client');
const { sendNotification } = require('../notificationsController/SocialNotification.js');
const db = new PrismaClient();

/* delete a  reel */
let deleteReel = async (req, res) => {
    const { id } = req.body

    if (!id ) return res.status(403).json({
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

    if (! checkReel) {
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
    const { id } = req.params

    if (! id) {
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

    if (! checkReel) {
        return res.status(403).json({
            error: {
                error_en: 'Reel id is not vaild',
                error_ar: 'Reel id is not valid'
            }
        })       
    }

    return res.status(200).json(checkReel)
}

let getMyReels = async (req, res) => {

    let { page } = req.query
    if (!page) page = 1;
    let maxReels = 20;

    let getMyreelList = await db.reels.findMany({
        where: {    
            user_id: req.user.id
        },
        include: {
            song: true,
        },
        skip: page == 1 ? 0 : (page * maxReels) - maxReels,
        take: maxReels,
    });

    return res.status(200).json(getMyreelList)
}

let publicReels = async (req, res) => {
    let { page } = req.query
    if (!page) page = 1;
    let maxReels = 20;

    let getMyreelList = await db.reels.findMany({
        include: {
            song: true,
        },
        skip: page == 1 ? 0 : (page * maxReels) - maxReels,
        take: maxReels,
    });
    
    return res.status(200).json(getMyreelList)
}

module.exports = { deleteReel, getOneReel,getMyReels, publicReels }