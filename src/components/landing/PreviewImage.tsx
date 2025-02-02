import React from "react";

const PreviewImage = () => {
  return (
    <div className="relative rounded-xl overflow-hidden hidden sm:block transform hover:scale-[1.02] transition-transform duration-300 mb-20 max-w-6xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
      <img
        src="/lovable-uploads/274d4461-71f9-4e12-abb3-812c2215fb65.png"
        alt="Bubble.io AI Voice Assistant Interface"
        className="w-full object-cover rounded-xl shadow-lg"
        style={{ height: "600px" }}
      />
    </div>
  );
};

export default PreviewImage;