import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    // Build search query
    let searchQuery = {};
    if (query) {
        searchQuery = {
            $or: [
                { title: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ]
        };
    }

    if (userId) {
        searchQuery.owner = userId;
    }

    try {
        // Build aggregate pipeline
        const aggregatePipeline = [
            { $match: searchQuery },
            { $sort: { [sortBy]: sortType === 'asc' ? 1 : -1 } }
        ];

        const aggregateQuery = Video.aggregate(aggregatePipeline);

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        };

        const videos = await Video.aggregatePaginate(aggregateQuery, options);
        

        // Send response
        return res
        .status(200)
        .json(
            new ApiResponse(200, 
                "Videos Fetched Successfully", 
                videos));
    } catch (error) {
        console.error('Error:', error);
        throw new Apierror(404, "Videos not Found");
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description,duration} = req.body
    // TODO: get video, upload to cloudinary, create video
    // console.log(req);
    
    // console.log(req);
    // console.log(req.files);
    
    const videopath = req.files?.videoFile[0]?.path
    // console.log(videopath);

    if(!videopath){
        new Apierror("402","Video is not Found")
    }
    
    const uploadVideo = await uploadOnCloudinary(videopath);
    console.log(uploadVideo);
    

    if (!uploadVideo) {
        throw new Apierror(500, "Failed to upload video to Cloudinary");
    }

    const thumbnailUrl = req.files?.thumbnail[0]?.path
    // console.log(thumbnailUrl);

    const uploadThumbnail = await uploadOnCloudinary(thumbnailUrl);
    // console.log(uploadThumbnail);
    

    if (!uploadThumbnail) {
        throw new Apierror(500, "Failed to upload thumbnail to Cloudinary");
    }

    const newVideo = new Video({
        title,
        description,
        videoFile:uploadVideo.url,
        thumbnail:uploadThumbnail.url,
        duration,
        owner:req.owner,
    })

    const savedVideo = await newVideo.save()

    return res
    .status(200)
    .json(
        200,
        "Video Updated SuccessFully",
        savedVideo
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new Apierror(402,"Video Id is required")
    }
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new Apierror(400, "Invalid Video ID format");
    }

    const video = await Video.findById(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video Fetched By Id Successfull",
            video
        )
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId){
        throw new Apierror(400,"video Id required!")
    }

    const { title , description } = req.body

    let thumbnailUrl;

    // console.log(req.file);
    
    // console.log(req.body);

    if(req.file){
        thumbnailUrl = req.file?.path
    }
    // console.log(thumbnailUrl);
    
    const updatedThumbnail = await uploadOnCloudinary(thumbnailUrl)
    if (!updatedThumbnail) {
        throw new Apierror(402,"thumbnail path is not found")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                thumbnail:updatedThumbnail.url,
                title,
                description,
                
            },

        },
        {new:true}
    )

    if(!video){
        throw new Apierror(402,"Video not found");
    }

    return res
    .status(200)
    .json(
        200,"Video Updated Successfully",
        video
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new Apierror(400,"Video Id required");
    }

    const video = await Video.findByIdAndDelete(videoId)

    if(!video) {
        throw new Apierror(404,"Video not found")
    }

    return res
    .status(200)
    .json(200,
        "Video Deleted Successfully",
        video
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new Apierror(404,"Video Id required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new Apierror("Video not found")
    }

    video.isPublished = !video.isPublished

    const updateVideo = await video.save()

    return res
    .status(200)
    .json(
         200,
        `Video ${video.isPublished ? 'published' : 'unpublished'} successfully`,
         video
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}