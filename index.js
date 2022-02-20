import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import bodyParser from "body-parser"

import Authentication from "./routes/Authentication.js"
import Songs from "./routes/Songs.js"
import Playlist from "./routes/Playlist.js"

const app = express()

dotenv.config()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())

app.use("/api/auth", Authentication)
app.use("/api/songs", Songs)
app.use("/api/playlist", Playlist)

mongoose.connect(process.env.DB_URI, {
}).then(() => {
//
}).catch((error) => {
    console.log(error) 
})

app.listen(process.env.PORT, () => {
    console.log("App is alive!")
})