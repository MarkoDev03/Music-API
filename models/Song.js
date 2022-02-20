import mongoose from "mongoose"

const songSchema = new mongoose.Schema({
    audio: {
        type:String,
        required:true
    },
    cover: {
        type:String,
        required: true
    },
    name: {
       type: String,
       unique:true,
       required:true
    },
    authors: [String],
    genres: [String],
    plays: Number,
    length: Number,
    published: {
        type: Date,
        default:Date.now
    },
    category: String
})

const Song = mongoose.model("Song", songSchema)
export default Song