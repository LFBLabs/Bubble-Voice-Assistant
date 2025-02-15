
import React from "react";

const PreviewImage = () => {
  return (
    <div className="space-y-8 hidden sm:block mb-20 max-w-6xl mx-auto">
      {/* First Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/2c3bd22e-75ae-425f-ac2c-ab007e4a64a6.png"
          alt="Bubble.io Authentication Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Second Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/d898329e-927d-425d-b0bc-67a244add311.png"
          alt="Bubble.io Voice Assistant Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
};

export default PreviewImage;
