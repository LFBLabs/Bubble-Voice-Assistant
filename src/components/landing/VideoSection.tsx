
import React from "react";

const VideoSection = () => {
  return (
    <div className="max-w-4xl mx-auto mb-20">
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <video 
          className="w-full h-full rounded-xl" 
          controls
          playsInline
          preload="metadata"
        >
          <source src="/lovable-uploads/demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoSection;
