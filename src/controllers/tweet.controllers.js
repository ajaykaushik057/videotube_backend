import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    const userId = req.user._id;

    if (!content) {
        throw new Apierror(404,"Tweet content is required")
    }

    const newTweet = new Tweet({
        content,
        owner:userId
    })

    const savedTweet = await newTweet.save()

    return res
    .status(200)
    .json(
        201,
        "tweet created successfully",
        savedTweet
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const userId = req.user?._id || req.params.userId

    if (!userId) {
        throw new Apierror(404,"User Id is required!")
    }

    const tweets = await Tweet.find({owner:userId})

    if(!tweets){
        throw new Apierror(404,"tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweets,"Tweets retrieved successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params;

    if (!tweetId) {
        throw new Apierror(404, "Tweet ID required!");
    }

    const { content } = req.body;

    if (!content) {
        throw new Apierror(402, "Content is required!");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId, 
        { content }, 
        { new: true } 
    );

  
    if (!updatedTweet) {
        throw new Apierror(404, "Tweet not found!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,updatedTweet,"Tweet updated successfully"));
});


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    let {tweetId} = req.params

    if(!tweetId) {
        throw new Apierror(404,"Tweet Id required!")
    }

    tweetId = tweetId.trim();

    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new Apierror(400, "Invalid Tweet Id format!");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deletedTweet) {
        throw new Apierror(404,"tweet not found!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,deletedTweet,"tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}