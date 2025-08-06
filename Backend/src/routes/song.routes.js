const express = require("express");
const multer = require("multer");
const uploadFile = require("../service/storage.service");
const router = express.Router();
const songModel = require("../models/song.model")

const upload = multer({ storage: multer.memoryStorage() });

router.post('/songs', upload.single("audio"),async (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);  // This should log file info
   const fileData = await uploadFile(req.file);

   const song = await songModel.create({
    title:req.body.title,
    artist:req.body.artist,
    audio:fileData.url,
    mood:req.body.mood
   })
   
    res.status(201).json({
        message: 'Song created successfully',
        song: req.body
    });
});

router.get('/songs', async (req, res) => {
    try {
        const { mood } = req.query;

        const songs = await songModel.find({
            mood: mood
        });

        res.status(200).json({
            message: "Songs fetched successfully",
            songs
        });
    } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


module.exports = router;
// xoJikjCXOQHzGeqsoGkoLz0SvdZlfRNQxRR2l-046qg