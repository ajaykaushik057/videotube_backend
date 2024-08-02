import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query='', sortBy= 'createdAt', sortType='desc', userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    let searchQuery ={}
    if(query){
        searchQuery={
            $or:[
                {
                    title: new RegExp(query,'i')
                },
                {
                    description: new RegExp(query,'i')
                }
            ]
        }
    }

    if(userId){
        searchQuery.owner=userId
    }


    try {
       const aggregate = await Video.aggregate(
        [
            {$sort:{
                [sortBy]:sortType === 'asc' ? 1 : -1
            }},
            {
                $match:searchQuery
            }
        ]
       )

       
    const options ={
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
       
    }

    const videos = await Video.aggregatePaginate(aggregate,options)

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Video Fetched Successufully" , videos)
    )

    } catch (error) {
        throw new Apierror("404 Video not Found");
        
    }

    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}