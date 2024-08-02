import { Router } from "express";
import { getAllVideos } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/get-videos").get(getAllVideos) 

// .post(
//     upload.fields([
//         {
//             name: "videoFile",
//             maxCount: 1,
//         },
//         {
//             name: "thumbnail",
//             maxCount: 1,
//         },
        
//     ]),
//     publishAVideo
// );


export default router