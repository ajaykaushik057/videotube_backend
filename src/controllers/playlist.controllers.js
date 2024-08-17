import mongoose, {isValidObjectId, set} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    
    if (!name || !description) {
        throw new Apierror(402,"name or description required !")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user
    })

    if (!playlist) {
        throw new Apierror(404,"playlist not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            " Playlist Created Successfully!!"
        )
    )


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new Apierror(400, "User ID is required!");
    }

    const userPlaylists = await Playlist.find({ owner: userId });

    if (userPlaylists.length === 0) {
        throw new Apierror(404, "No playlists found for this user!");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userPlaylists,
                "User playlists fetched successfully!"
            )
        );
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId) {
        throw new Apierror(402,"playlist id is required!")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new Apierror(404,"Playlist not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            playlist,
            "Playlist fetched by Id successfully!"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId || !videoId) {
        throw new Apierror(402,"playlistId or VideoId required !")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { video: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new Apierror(404, "Playlist not found!");
    }


    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Video Added Successfully!"
        )
    )
    
    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new Apierror(402, "playlistId or videoId required!");
    }

    const userId = req.user.id; 

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: userId },  
        { $pull: { videos: videoId } },      
        { new: true }                       
    );

    if (!playlist) {
        throw new Apierror(404, "Playlist not found or unauthorized action.");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed successfully!")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new Apierror(402,"playlist Id required or Invalid!!")
    }

    const playlist = await Playlist.findById(playlistId)
    console.log(playlist);
    

    if (!playlist) {
        throw new Apierror(404,"Playlist not found!")
    }

    if (playlist.owner.toString() != (req.user?._id).toString()) {
        throw new Apierror(401,"Unauthorized access")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlist)
    console.log(deletedPlaylist);
    

    return res
    .status(200)
    .json(
        200,
        new ApiResponse(200,deletedPlaylist,"video playlist deleted successfully! "),
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!playlistId.trim() || !isValidObjectId(playlistId)) {
        throw new Apierror(400,"Playlist Id required or Invalid ")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new Apierror(404,"playlist not found!")
    }

    if (playlist.owner.toString() != (req.user?._id).toString()) {
        throw new Apierror(401,"unauthorized access")
    }

    if (!(name||description)) {
        throw new Apierror(400,"name or description required!")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$set:{name,description}} ,
        {new:true}  
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedPlaylist,"Updated Successfully!")
    )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}