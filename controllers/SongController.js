import Song from "../models/Song.js";
import Playlist from "../models/PlayList.js";
import mongoose from "mongoose"

//songs/add-new
export const AddNew = async (req, res) => {

    if (req.body.name.length == 0 || cover.length == 0 || audio.length == 0) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ message: "Action denied!" })
    }
    
    const song = new Song({
        audio: req.body.audio,
        cover: req.body.cover,
        name : req.body.name,
        authors: req.body.authors,
        genres: req.body.genres,
        plays: 0,
        length: req.body.length,
        category: req.body.category 
    })

    try {
        const newSong = await song.save();
        res.status(200).json(newSong)
    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//songs/play
export const Play = async (req, res) => {
    const { id } = req.body

    try {
        if (!mongoose.Types.ObjectId(id)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Song not found!" })
        }

        let song = await Song.findById(id)
        const plays = Number(song.plays)

        await Song.findByIdAndUpdate(id, { plays: plays + 1 }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(404).json({ message: "Try again!" })
            } else {
                res.status(200).json(docs)
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//songs/list
export const All = async (req, res) => {
    try {
         let songs = await Song.find()
         res.status(200).json(songs)
    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//songs/search
export const Search = async (req, res) => {
    try {
        let songs = await Song.find({ name: req.body.name })
        res.status(200).json(songs)
   } catch(error) {
       res.setHeader('Content-Type', 'application/json')
       return res.status(500).json({ message: error.message })
   }
}

//songs/edit-song
export const EditSong = async (req, res) => {
    const { id } = req.body

    try {
        if (!mongoose.Types.ObjectId(id)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Song not found!" })
        }

        let song = await Song.findById(id)
        if (!song) { 
        res.setHeader('Content-Type', 'application/json')
        return res.status(404).json({ message:"Song not found!" })
        }

        if (req.body.name.length == 0 || cover.length == 0 || audio.length == 0) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(400).json({ message: "Action denied!" })
        }

        let editedSong = await Song.findById(id)
        let playlists = await Playlist.find()

        await Song.findByIdAndUpdate(id, {
            audio: req.body.audio,
            cover: req.body.cover,
            name : req.body.name,
            authors: req.body.authors,
            genres: req.body.genres,
            length: req.body.length,
            category: req.body.category 
        }, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(500).json(error)
            } else {
                res.status(200).json(docs)
            }
        })

        let editedSongRes = await Song.findById(id)

        if (playlists.length > 0) {
            playlists.forEach((playlist) => {
              playlist.songs.forEach((song) => {
                   if (song == editedSong) {
                    let newSongs = playlist.songs.filter((song) => {
                        return song != editedSong
                    })
                    newSongs.push(editedSongRes)

                     Playlist.findByIdAndUpdate(playlist._id, {
                        songs: newSongs
                    },  (error, docs) => {
                        if (error) {
                            res.setHeader('Content-Type', 'application/json')
                            return res.status(400).json(error)
                        } else {
                            res.status(200).json(docs)
                        }
                    })
                   }
                })
            })
        }

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}

//songs/delete-song
export const DeleteSong = async (req, res) => {
    const { id } = req.body

    try {
        if (!mongoose.Types.ObjectId(id)) {
            res.setHeader('Content-Type', 'application/json')
            return res.status(404).json({ message:"Song not found!" })
        }

        let songDeleting = await Song.findById(id)
        let playlists = await Playlist.find()

        if (playlists.length > 0) {
            playlists.forEach((playlist) => {
                let newSongs = playlist.songs.filter((song) => {
                    return song != songDeleting
                })
                 Playlist.findByIdAndUpdate(playlist._id, {
                    songs: newSongs
                },  (error, docs) => {
                    if (error) {
                        res.setHeader('Content-Type', 'application/json')
                        return res.status(400).json(error)
                    } else {
                        res.status(200).json(docs)
                    }
                })
            })
        }

        await Song.findByIdAndDelete(id, (error, docs) => {
            if (error) {
                res.setHeader('Content-Type', 'application/json')
                return res.status(400).json({ message:"Error" })
            } else {
                return res.status(200).json({ message:"Song deleted!" })
            }
        })

    } catch(error) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(500).json({ message: error.message })
    }
}