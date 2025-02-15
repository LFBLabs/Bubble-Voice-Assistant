
import React from "react";

const PreviewImage = () => {
  return (
    <div className="space-y-8 hidden sm:block mb-20 max-w-6xl mx-auto">
      {/* Login Interface */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/03e36af9-62c8-4989-80da-eac17b32570d.png"
          alt="Bubble.io Voice Assistant Login Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Voice Assistant Interface */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/a2b554d6-9e65-4db3-9fe0-8638007093d6.png"
          alt="Bubble.io Voice Assistant Main Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Settings Interface */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/8da82d1d-5a76-4f72-ab65-f903ef11bb4f.png"
          alt="Bubble.io Voice Assistant Settings Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Feedback Interface */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/82f3f472-6e8a-4ed3-9044-c492feb4a3ce.png"
          alt="Bubble.io Voice Assistant Feedback Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
};

export default PreviewImage;
