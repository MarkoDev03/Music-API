import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique:true
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    avatar: {
        type:String,
        default:"https://st3.depositphotos.com/1767687/16607/v/600/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg"
    },
    createdAt: {
        type: Date,
        default:Date.now()
    }, 
    changedAt: {
        type: Date,
        default:Date.now()
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    }
})

const User = mongoose.model("User", userSchema)
export default User;