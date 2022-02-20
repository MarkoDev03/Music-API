import express from "express"
import { All, AddNew, Play, EditSong, Search, DeleteSong } from "../controllers/SongController.js"

const Router = express.Router()

Router.get("/list", All)

Router.post("/add-new", AddNew)
Router.post("/play", Play)
Router.post("/search", Search)

Router.put("/edit-song", EditSong)

Router.delete("/delete-song", DeleteSong)

export default Router