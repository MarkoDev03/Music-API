import express from "express"
import { MyPlaylists,  GetPlayList, CreatePlaylist, SetToPublicOrPrivate, RemoveSong, AddSong, ChangeName, DeletePlaylist, RemoveAllSongs} 
from "../controllers/PlaylistController.js"

const Router = express.Router()

Router.get("/my-playlist", MyPlaylists)
Router.get("/get-playlist", GetPlayList)

Router.post("/create", CreatePlaylist)

Router.put("/set-to-public-or-private", SetToPublicOrPrivate)
Router.put("/add-song", AddSong)
Router.put("/remove-song", RemoveSong)
Router.put("/change-name", ChangeName)
Router.put("/remove-all-songs", RemoveAllSongs)

Router.delete("/delete-playlist", DeletePlaylist)

export default Router