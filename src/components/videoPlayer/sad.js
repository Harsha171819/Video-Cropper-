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
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 360 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // 🖼 Sync Preview Canvas with Main Video (Even When Seeking)
  useEffect(() => {
    if (!previewEnabled || !videoRef.current || !previewCanvasRef.current)
      return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const updateCanvas = () => {
      if (!previewEnabled) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      requestAnimationFrame(updateCanvas);
    };

    updateCanvas(); // Start updating immediately

    return () => cancelAnimationFrame(updateCanvas);
  }, [previewEnabled]);

  // Update Video Size & Aspect Ratio
  useEffect(() => {
    if (videoRef.current) {
      const { clientWidth: width, clientHeight: height } = videoRef.current;
      setVideoSize({ width, height });
    }
  }, [aspectRatio, videoRef.current]);

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

  const handleMouseDown = () => {
    setDragging(true);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Video & Preview Container */}
      <div className="flex gap-4 w-full">
        {/* 🎬 Main Video Section */}
        <div className="relative w-1/2">
          <h2 className="text-white text-sm mb-2">Main Video</h2>
          <div className="relative">
            <div className="relative w-full border border-gray-700 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    const { clientWidth, clientHeight } = videoRef.current;
                    setVideoSize({ width: clientWidth, height: clientHeight });
                  }
                }}
                className="w-full h-full object-fill"
              />
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
        </div>

        {/* 🖼️ Preview Video (Canvas) */}
        {previewEnabled && (
          <div className="relative w-1/2">
            <h2 className="text-white text-sm mb-2">Preview Video</h2>
            <canvas
              ref={previewCanvasRef}
              width={videoSize.width}
              height={videoSize.height}
              className="w-full h-auto rounded-lg border border-gray-700 opacity-80"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
