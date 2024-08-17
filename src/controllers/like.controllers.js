import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import {Comment} from "../models/comment.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if (!videoId.trim()|| !isValidObjectId(videoId)) {
        throw new Apierror(402,"video Id required or Invalid!")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new Apierror(404,"video not found!")
    }

    const isLikedAllReady = await Like.find({
        video:videoId,
        likedBy:req.user?._id
    })

    if (isLikedAllReady.length==0) {
        const likeDoc = await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(200,{},"Liked Video!")
        )
    }

    else{
        const deleteDoc = await Like.findByIdAndDelete(isLikedAllReady[0]._id)

        return res
        .status(200)
        .json(new ApiResponse(200,{},"remove liked from video!"))
    }

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId.trim() || !isValidObjectId(commentId)) {
        throw new Apierror(402,"comment Id required or Invalid !")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new Apierror(404,"comment not found !")
    }

    const isLikeallready = await Like.find({
        comment:commentId,
        likedBy:req.user?._id
    })

    if (isLikeallready.length==0) {
        const newLike = await Like.create({
            comment:commentId,
            likedBy:req.user?._id
        })

        return res.status(200).json(new ApiResponse(200,{},"liked comment!"))
    }

    else{
        const deleteLike = await Like.findByIdAndDelete(isLikeallready[0]?._id)

        return res.status(200).json(new ApiResponse(200,{},"Remove liked from comment"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!tweetId.trim() || !isValidObjectId(tweetId)) {
        throw new Apierror(402,"tweet id required or Invalid")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new Apierror(404,"tweet not found!")
    }

    const isLikeallready = await Like.find({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    // console.log(isLikeallready);
    

    if (isLikeallready.length==0) {
        const newlike = await Like.create({
            tweet:tweetId,
            likedBy:req.user?._id
        })

        return res.status(200).json(new ApiResponse(200,{},"liked tweet !"))
    }

    else{
        const deleteLike = await Like.findByIdAndDelete(isLikeallready[0]._id)

        return res.status(200).json(new ApiResponse(200,{},"remove liked from tweet!"))
    }
 }
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const videos = await Like.aggregate([
        {
            $match: { likedBy: userId }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            owner: 1,
                            title: 1,
                            description: 1,
                            views: 1,
                            duration: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: { $arrayElemAt: ["$video", 0] } 
            }
        },
    ]);

    if (videos.length === 0) {
        throw new Apierror(404, "Liked video not found!");
    }

    return res.status(200).json(
        new ApiResponse(200, { videos, videosCount: videos.length }, "Liked videos retrieved successfully!")
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}