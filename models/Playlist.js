import mongoose from "mongoose"

const playlistSchema = new mongoose.Schema({
     user: { type: mongoose.Schema.Types.ObjectId, ref:"User" },
     songs: [{ type: mongoose.Schema.Types.ObjectId, ref:"Song" }],
     createdAt: {
         type: Date,
         default:Date.now
     }, 
     lastModified: {
        type: Date,
        default:Date.now
    },
     name: {
         type: String,
         required: true
     },
     isPublic: {
         type: Boolean,
         default: false
     }
})

const Playlist = mongoose.model("Playlist", playlistSchema)
export default Playlist