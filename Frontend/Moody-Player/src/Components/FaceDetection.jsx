import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "./FaceDetection.css";
import axios from "axios";

const FaceDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [dominantExpression, setDominantExpression] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [songs, setSongs] = useState([]);
  const [showSongs, setShowSongs] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Camera error:", err));
    };

    loadModels().then(startVideo);
  }, []);

  const detectExpression = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const dims = {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    };

    faceapi.matchDimensions(canvasRef.current, dims);
    const resized = faceapi.resizeResults(detections, dims);
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, dims.width, dims.height);

    faceapi.draw.drawDetections(canvasRef.current, resized);
    faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);

    if (detections.length > 0) {
      const expressions = detections[0].expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const mainExpression = Object.keys(expressions).find(
        (key) => expressions[key] === maxValue
      );
      setDominantExpression(mainExpression);
      console.log("Detected Mood:", mainExpression);

      // ✅ Fetch songs from backend based on mood
      try {
        const response = await axios.get(
          `http://localhost:3000/songs?mood=${mainExpression}`
        );
        setSongs(response.data.songs);
        setShowSongs(true);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    } else {
      setDominantExpression("No face detected");
      setShowSongs(false);
      document.querySelectorAll("audio").forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      setSongs([]);
    }
  };

  return (
    <div className="container">
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay muted width="360" height="270" />
        <canvas ref={canvasRef} width="360" height="270" />
        {dominantExpression && (
          <div className="mood-box">
            Mood: {dominantExpression.toUpperCase()}
          </div>
        )}
      </div>

      <button onClick={detectExpression} className="detect-btn">
        Detect Mood
      </button>

      {showSongs && songs.length > 0 && (
        <div className="songs-section">
          <h2>Songs Based on Your Mood</h2>
          <ul>
            {songs.map((song, index) => (
              <li key={index} className="song-card">
                <div className="song-info">
                  <strong>{song.title}</strong> — {song.artist}
                </div>
                <audio
                  controls
                  ref={(el) => {
                    if (index === 0 && el) {
                      el.play().catch(() => {}); // Autoplay first song on new mood
                    }
                  }}
                  className="audio-player"
                >
                  <source src={song.audio} type="audio/mp3" />
                  Your browser does not support the audio element.
                </audio>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FaceDetection;
