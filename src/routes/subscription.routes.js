import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js"

const router = Router()

router.use(verifyJWT)

router.route("/c/:channelId").post(toggleSubscription)

router.route("/c/:subscriberId").get(getSubscribedChannels)

// router.route("/u/:subscriberId").get(getUserChannelSubscribers)

router.route("/u/:channelId").get(getUserChannelSubscribers)

export default router