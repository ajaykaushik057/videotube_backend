import { Router } from "express";
import { getAllVideos , publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }
 from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/get-videos").get(getAllVideos) 

router.route("/publish-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
        
    ]),
    publishAVideo
);

router.route("/:videoId").get(getVideoById)

router.route("/:videoId").patch(upload.single("thumbnail"),updateVideo)

router.route("/:videoId").delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);


export default router