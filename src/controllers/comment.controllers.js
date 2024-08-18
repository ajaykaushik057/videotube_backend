import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {Like} from "../models/like.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query

      page = isNaN(page) ? 1 : Number(page);
      limit = isNaN(page) ? 10 : Number(limit);

    if (!videoId.trim() || !isValidObjectId(videoId)) {
        throw new Apierror(402,"videoId required or Invalid!")
    }

    if (page <=0) {
        page=1
    }
    if (limit<=0) {
        limit=10
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                    $project:{
                        username:1,
                        fullname:1,
                        avatar:1
                    }
                }
              ]
            },
        },
        {
           $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"comment",
            as:"likeCount"
           }
        },
        {
            $addFields:{
                likeCount:{
                    $size:"$likeCount"
                }
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $skip: (page-1)*limit
        },
        {
            $limit:limit
        }
    ])

    if (comments.length == 0) {
        throw new Apierror(500, "commets not found!");
      }
      return res
        .status(200)
        .json(new ApiResponse(200, comments, "comments fetched successfully!"));

    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    // console.log(videoId);
    // console.log(content);
    
    

    if (!videoId.trim()|| !isValidObjectId(videoId)) {
        throw new Apierror(402,"video Id required or Invalid!")
    }

    if (!content) {
        throw new Apierror(404,"content is required for comment!")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new Apierror(404,"video not found!")
    }

    const newComment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: req.user?._id
    })

    if (!newComment) {
        throw new Apierror(500,"Error during creating comment!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,newComment,"comment added to video!")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const {content} = req.body

    if (!commentId.trim()|| !isValidObjectId(commentId)) {
        throw new Apierror(402,"comment Id required or Invalid!")
    }

    if (!content) {
        throw new Apierror(404,"content required!")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new Apierror(404,"comment not found!")
    }

    if (comment.owner.toString() != (req.user?._id).toString()) {
        throw new Apierror(404,"Unauthorized access")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content,
            }
        } ,
        {
            new:true
        }
    )

    if (!updatedComment) {
        throw new Apierror(500,"Error during Updation")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            updatedComment,
            "comment updated successfully!"
        )
    )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!commentId.trim() || !isValidObjectId(commentId)) {
        throw new Apierror(402,"comment Id requird or Invalid")
    }

    const comment = await Comment.findById(commentId)
 
    if (!comment) {
        throw new Apierror(404,"comment not found!")
    }

    if (comment.owner.toString() != (req.user?._id).toString()) {
        throw new Apierror(404,"Unauthorized access")
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    const likeComment = await Like.deleteMany({comment:new mongoose.Types.ObjectId(commentId)})

    if (!deletedComment) {
        throw new Apierror(500,"Error During deleted comment!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {},
            "Comment Deleted Successfully!"
        )
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
 }