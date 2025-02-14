import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

const aspectRatios = {
  "9:18": 9 / 18,
  "9:16": 9 / 16,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "1:1": 1 / 1,
  "4:5": 4 / 5,
};

const playbackSpeeds = [0.5, 1, 1.5, 2];

const VideoPlayer = ({ videoSrc, showCropper, previewEnabled }) => {
  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 360 });

  const [aspectRatio, setAspectRatio] = useState(aspectRatios["9:16"]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    const { clientWidth: width, clientHeight: height } = videoRef.current;
    setVideoSize({ width, height });

    const newCropWidth = height * Number(aspectRatio);
    const newCropHeight = height;

    setCropSize(() => ({
      width: newCropWidth,
      height: newCropHeight,
    }));
    setCropPosition({ x: 0, y: 0 });
  }, [aspectRatio, showCropper]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // ⏳ Track and store points while the video is playing
  useEffect(() => {
    if (!playing || !videoRef.current) return;

    const timeStamp = videoRef.current.currentTime;
    const newPoint = {
      timeStamp,
      coordinates: cropPosition,
      volume,
      playbackRate: playbackSpeed,
    };

    console.log(newPoint);
    setDataPoints((prevPoints) => [...prevPoints, newPoint]);
  }, [playing, volume, playbackSpeed, cropPosition]);

  useEffect(() => {
    const drawCroppedFrame = () => {
      if (!previewEnabled || !videoRef.current || !previewCanvasRef.current)
        return;

      const video = videoRef.current;
      const canvas = previewCanvasRef.current;
      const ctx = canvas.getContext("2d");

      const updateCanvas = () => {
        if (video.paused || video.ended) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

        // ** Fix Scaling Issue **
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Convert cropper position & size from **DOM space** to **video space**
        const scaleX = videoWidth / video.clientWidth;
        const scaleY = videoHeight / video.clientHeight;

        const sx = cropPosition.x * scaleX; // Corrected source X
        const sy = cropPosition.y * scaleY; // Corrected source Y
        const sWidth = cropSize.width * scaleX; // Corrected source width
        const sHeight = cropSize.height * scaleY; // Corrected source height

        ctx.drawImage(
          video, // 1️⃣ Video element as source
          sx,
          sy,
          sWidth,
          sHeight, // 2️⃣ Source: Cropper in Video Space
          0,
          0,
          canvasWidth,
          canvasHeight // 3️⃣ Destination: Full Canvas
        );

        requestAnimationFrame(updateCanvas);
      };

      requestAnimationFrame(updateCanvas);
    };

    drawCroppedFrame();
  }, [cropPosition, cropSize, playing, showCropper]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration || 0);
  };

  const handleMouseMove = (e) => {
    if (!dragging || !videoRef.current) return;

    const videoRect = videoRef.current.getBoundingClientRect();
    let newX = e.clientX - videoRect.left - cropSize.width / 2;
    let newY = e.clientY - videoRect.top - cropSize.height / 2;

    newX = Math.max(0, Math.min(newX, videoRect.width - cropSize.width));
    newY = Math.max(0, Math.min(newY, videoRect.height - cropSize.height));

    setCropPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div
      className="relative w-full max-w-4xl mx-auto flex flex-col gap-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Video & Preview Container */}
      <div className="flex gap-4 w-full">
        {/* 🎬 Main Video Section */}
        <div className="relative w-1/2">
          <div className="relative">
            <div className="relative w-full border border-gray-700 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-fill"
                style={{ position: "relative" }}
              />

              {/* 🖼️ Cropper (Draggable) */}
              {showCropper && (
                <div
                  className="absolute border-2 border-gray-400/60 cursor-move"
                  style={{
                    top: `${cropPosition.y}px`,
                    left: `${cropPosition.x}px`,
                    width: `${cropSize.width}px`,
                    height: `${cropSize.height}px`,
                  }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-gray-500/40"></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 🎛 Controls Section */}
          <div className="w-full flex flex-col rounded-lg text-white mt-4">
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Progress Bar */}
              <input
                type="range"
                min="0"
                max={duration || 1}
                value={currentTime}
                onChange={(e) => {
                  if (!videoRef.current) return;
                  const newTime = parseFloat(e.target.value);
                  videoRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                }}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Volume Control */}
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-300">
                {Math.floor(currentTime / 60)}:
                {Math.floor(currentTime % 60)
                  .toString()
                  .padStart(2, "0")}{" "}
                / {Math.floor(duration / 60)}:
                {Math.floor(duration % 60)
                  .toString()
                  .padStart(2, "0")}
              </span>

              <div className="flex items-center gap-2">
                <Volume2 size={18} className="text-gray-300" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => {
                    if (!videoRef.current) return;
                    const newVolume = parseFloat(e.target.value);
                    videoRef.current.volume = newVolume;
                    setVolume(newVolume);
                  }}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Playback Speed & Aspect Ratio Dropdowns */}
          <div className="flex gap-4 mt-4">
            {/* Playback Speed */}
            <div className="relative w-48">
              <label
                htmlFor="playbackSpeed"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-300 text-xs"
              >
                Playback Speed
              </label>
              <select
                className="pl-24 pr-10 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-500 appearance-none w-full"
                value={playbackSpeed}
                id="playbackSpeed"
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              >
                {playbackSpeeds.map((speed) => (
                  <option key={speed} value={speed}>
                    {speed}x
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                ▼
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="relative w-56">
              <label
                htmlFor="aspectRatio"
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-300 text-xs"
              >
                Cropper Aspect Ratio
              </label>
              <select
                className="pl-36 pr-10 py-2 rounded-lg bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-500 appearance-none w-full"
                value={aspectRatio}
                id="aspectRatio"
                onChange={(e) => {
                  setAspectRatio(e.target.value);
                }}
              >
                {Object.keys(aspectRatios).map((key) => (
                  <option key={key} value={aspectRatios[key]}>
                    {key}
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* 🖼️ Preview Video (Canvas) */}
        {showCropper ? (
          <div className="relative w-1/2 flex flex-col items-center">
            <h2 className="text-white text-sm mb-2">Preview</h2>
            <canvas
              ref={previewCanvasRef}
              width={videoSize.height * Number(aspectRatio)}
              height={videoSize.height}
              className="rounded-lg border border-gray-700 opacity-80"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-1/2 h-96 bg-gray-900 text-gray-400 rounded-lg border border-gray-700">
            <h2 className="text-sm mb-4">Preview</h2>

            {/* Play Icon */}
            <div className="flex flex-col items-center">
              <Play size={40} className="text-gray-500" />
              <p className="mt-2 text-white">Preview not available</p>
              <p className="text-sm text-gray-400 mt-1 text-center">
                Please click on <strong>“Start Cropper”</strong> <br /> and then
                play video
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
