import React, { useState, useRef } from "react";
import VideoPlayer from "../videoPlayer";

const videosrc =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const ActionButton = ({ label, onClick, variant = "primary" }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded text-sm transition duration-200 ${
      variant === "primary"
        ? "bg-purple-600 text-white hover:bg-purple-700"
        : "bg-gray-700 text-white hover:bg-gray-600"
    }`}
  >
    {label}
  </button>
);

const Cropper = ({ onClose }) => {
  const [cropping, setShowCropping] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Main Content: Video & Preview Sections */}
      <div className="flex">
        <VideoPlayer
          videoSrc={videosrc}
          showCropper={cropping}
          previewEnabled
        />
      </div>

      {/* Full-width Separator */}
      <hr className="-mx-6 border-gray-500/50 my-4" />

      {/* Footer: Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <ActionButton
            label="Start Cropper"
            onClick={() => setShowCropping(true)}
          />
          <ActionButton
            label="Remove Cropper"
            onClick={() => setShowCropping(false)}
          />
          <ActionButton
            label="Generate Preview"
            // onClick={() => setShowCropping(false)}
          />
        </div>
        <ActionButton label="Cancel" onClick={onClose} variant="secondary" />
      </div>
    </div>
  );
};

export default Cropper;
