import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (!channelId) {
        throw new Apierror(400, "Channel ID required!");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new Apierror(404, "Channel not found!");
    }

    if (channelId.toString() === userId.toString()) {
        throw new Apierror(400, "You cannot subscribe to your own channel!");
    }

    const subscription = await Subscription.findOne({ channel: channelId, user: userId });

    let isSubscribed;

    if (subscription) {
        await Subscription.deleteOne({ channel: channelId, user: userId });
        isSubscribed = false;
    } else {
        await Subscription.create({ channel: channelId, user: userId });
        isSubscribed = true;
    }

    // Find the user again to ensure `user` is properly defined
    const user = await User.findById(userId);

    if (!user.subscriptions) {
        user.subscriptions = [];
    }

    if (isSubscribed) {
        user.subscriptions.push(channelId);
    } else {
        user.subscriptions = user.subscriptions.filter(id => id.toString() !== channelId);
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, user, "Subscription toggled successfully!")
    );
});



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new Apierror(400,"Channel Id required!")
    }

    

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}