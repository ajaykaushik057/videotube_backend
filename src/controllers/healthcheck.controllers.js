import { Apierror } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async(req,res)=>{
    res.status(200)
    .json(
        new ApiResponse(200,{},"system working fine!")
    )
})

export {healthCheck}