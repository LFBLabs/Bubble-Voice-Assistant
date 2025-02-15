
import React from "react";

const PreviewImage = () => {
  return (
    <div className="space-y-8 hidden sm:block mb-20 max-w-6xl mx-auto">
      {/* First Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/5cb0ec5b-2701-423e-a4e3-51ae4b64d618.png"
          alt="Bubble.io Task Flow Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Second Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/a0e4636a-0484-4785-bf31-9a1f7fcde80b.png"
          alt="Bubble.io Employee Search Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
};

export default PreviewImage;
