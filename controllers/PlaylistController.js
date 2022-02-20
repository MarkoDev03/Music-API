import mongoose from "mongoose"
import Song from "../models/Song.js"
import User from "../models/User.js"
import Playlist from "../models/PlayList.js"

//playlist/my-playlists
export const MyPlaylists = async (req, res) => {
    const { id } = req.body

    try {
        if (!mongoose.Types.ObjectId(id)) {
            res.setHeader('Content-Type', 'application/json')
            return  res.status(404).json({ message:"User not found!" })
        }

       let user = await User.findById(id)
       let playlists = await Playlist.find({ user: user })
       if (!playlists) {
       res.setHeader('Content-Type', 'application/json') 
       return res.status(404).json({ message: "No playlists!" })
       }

       res.status(200).json([playlists])
    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/create
export const CreatePlaylist = async (req, res) => {
    const { id } = req.body

    try {
        if (!mongoose.Types.ObjectId(id)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"User not found!" })
        }

       const user = await User.findById(id)
       if (!user) {  
       res.setHeader('Content-Type', 'application/json')
       return res.status(404).json({ message:"User not found!" })
       }

       if (req.body.name.length == 0) {
           res.setHeader('Content-Type', 'application/json')
           return res.status(400).json({ message: "Action denied!" })
       }

       let playlist = new Playlist({
          user: user,
          songs: [],
          name: req.body.name,
       })

       let createdPlaylist = await playlist.save()
       res.status(200).json(createdPlaylist)
    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/add-song
export const AddSong = async (req, res) => {
    const { songid, userid } = req.body
    try {
        if (!mongoose.Types.ObjectId(songid)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Song not found!" })
        }

        if (!mongoose.Types.ObjectId(userid)) {
            res.setHeader('Content-Type', 'application/json')
            return  res.status(404).json({ message:"User not found!" })
        }

        const song = await Song.findById(songid)
        const user = await User.findById(userid)

        if (!song) {
        res.setHeader('Content-Type', 'application/json')
        return  res.status(404).json({ message:"Song not found!" })
        }

        if (!user) { 
        res.setHeader('Content-Type', 'application/json')
        return res.status(404).json({ message:"User not found!" }) 
        }

        const playlist = await Playlist.find({ user: user })
        if (!playlist) { 
        res.setHeader('Content-Type', 'application/json')
        return res.status(404).json({ message:"Playlist not found!" })
    }

        let songs = playlist.songs;
        songs.push(Song)

        await Playlist.findByIdAndUpdate(playlist._id, { songs: songs, lastModified:() => new Date.now() }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Action denied!" })
            } else {
                res.status(200).json({ message:"Added to playlist" })
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/remove-song
export const RemoveSong = async (req, res) => {
    const { songid, userid } = req.body
    try {
        if (!mongoose.Types.ObjectId(songid)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Song not found!" })
        }

        if (!mongoose.Types.ObjectId(userid)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"User not found!" })
        }

        const song = await Song.findById(songid)
        const user = await User.findById(userid)

        if (!song) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(404).json({ message:"Song not found!" })
        }

        if (!user) { 
        res.setHeader('Content-Type', 'application/json')
        return  res.status(404).json({ message:"User not found!" })
        }

        const playlist = await Playlist.find({ user: user })
        if (!playlist) {
            res.setHeader('Content-Type', 'application/json') 
            return  res.status(404).json({ message:"Playlist not found!" })
        }

        let songs = playlist.songs;
        songs = songs.filter((songInList) => {
            return songInList.name !== song.name
        })

        await Playlist.findByIdAndUpdate(playlist._id, { songs: songs, lastModified:() => new Date.now() }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Action denied!" })
            } else {
                res.status(200).json({ message:"Removed from playlist" })
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/change-name
export const ChangeName = async (req, res) => {
    const { playlistId, userid, name } = req.body

    try {
        if (!mongoose.Types.ObjectId(playlistId)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Playlist not found!" })
        }

        if (!mongoose.Types.ObjectId(userid)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"User not found!" })
        }

        let user = await User.findById(userid)
        if (!user) { 
        res.setHeader('Content-Type', 'application/json')
        return res.status(404).json({ message:"User not found!" })
        }

        if (name.length == 0) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).json({ message:"Action denied!" })
        }

        await Playlist.findByIdAndUpdate(playlistId, {
            name: name
        }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Action denied!" })
            } else {
                res.status(200).json(docs)
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/set-to-public-or-private
export const SetToPublicOrPrivate = async (req, res) => {
    const { playlistId, userid, accessibility } = req.body

    try {
        if (!mongoose.Types.ObjectId(playlistId)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Playlist not found!" })
        }

        if (!mongoose.Types.ObjectId(userid)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"User not found!" })
        }

        let user = await User.findById(userid)
        if (!user) {
        res.setHeader('Content-Type', 'application/json') 
        return res.status(404).json({ message:"User not found!" })
        }

        await Playlist.findByIdAndUpdate(playlistId, {
            isPublic: accessibility
        }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Action denied!" })
            } else {
                res.status(200).json(docs)
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/get-playlist
export const GetPlayList = async (req, res) => {
    const { id } = req.body
    try {
        let playlist = await Playlist.findById(id)

        if (!playlist) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(404).json({ message:"Playlist not found!" })
    }

        res.status(200).json(playlist)
    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/delete-playlist
export const DeletePlaylist = async (req, res) => {
    const { playlistId } = req.body

    try {
        if (!mongoose.Types.ObjectId(playlistId)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Playlist not found!" })
        }

        await Playlist.findByIdAndDelete(playlistId, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Action denied!" })
            } else {
                res.status(200).json({ message: "Playlist deleted!" })
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//playlist/remove-all-songs
export const RemoveAllSongs = async (req, res) => {
    const { playlist } = req.body
    try {

        if (!mongoose.Types.ObjectId(playlist)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Playlist not found!" })
        }

        await Playlist.findByIdAndUpdate(playlist._id, { songs: [], lastModified:() => new Date.now() }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Action denied!" })
            } else {
                res.status(200).json({ message:"Playlist Cleared" })
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}