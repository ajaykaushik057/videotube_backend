import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const { channelId } = req.params;

  if (!channelId.trim() || !isValidObjectId(channelId)) {
    throw new Apierror(400, "channelid is required or invalid!");
  }
  const channel = await User.findById(channelId);

  if (!channel) {
    throw new Apierror("channel is not found !");
  }


  const isAlredySubscribed = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(req.user?._id),
    channel: new mongoose.Types.ObjectId(channelId),
  });

  if (isAlredySubscribed.length == 0) {
    const subscibedDoc = await Subscription.create({
      subscriber: new mongoose.Types.ObjectId(req.user?._id),
      channel: new mongoose.Types.ObjectId(channelId),
    });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "subscription added!"));
  } else {
    const deleteDoc = await Subscription.findOneAndDelete(
      isAlredySubscribed._id
    );
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "remove subscription!"));
  }
})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new Apierror(400, "Channel Id required!");
    }

    if (!isValidObjectId(channelId)) {
        throw new Apierror(400, "Invalid Channel Id!");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new Apierror(404, "Channel not found!");
    }

    const subscriptions = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberList",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            email: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                subscriberList: 1,
            },
        },
    ]);
    

    return res.status(200).json(
        new ApiResponse(
            200,
           subscriptions,
            "Subscriber list fetched successfully!"
        )
    );
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId
    if (!subscriberId) {
        throw new Apierror(400, "Subscriber ID required!");
    }

    if (!isValidObjectId(subscriberId)) {
        throw new Apierror(404, "Invalid Subscriber ID!");
    }

    // Check if the subscriber exists
    const user = await User.findById(subscriberId);
    if (!user) {
        throw new Apierror(404, "User not found!");
    }
    console.log(user);
    

    // Aggregate to find channels the user has subscribed to
    const subscribedToChannel = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedTo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $project: {
                subscribedTo: 1,
            },
        },
    ]);
    // console.log(subscribedToChannel);
    
    

    // Return the subscribed channels
    return res.status(200).json(
        new ApiResponse(
            200,
            { subscribedChannels: subscribedToChannel[0]?.subscribedTo || [] },
            "Subscribed channels fetched successfully!"
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}