import React from "react";

const Waveform = () => {
  return (
    <div className="flex items-center justify-center space-x-1 h-12">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-wave"
          style={{
            height: "24px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Waveform;