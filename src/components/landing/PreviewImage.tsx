
import React from "react";

const PreviewImage = () => {
  return (
    <div className="space-y-8 hidden sm:block mb-20 max-w-6xl mx-auto">
      {/* First Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/2399a8c9-bbac-4c6c-95ff-b447f679be14.png"
          alt="Bubble.io Builder Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Second Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/be10ed1e-5212-4617-ae6c-628e98788454.png"
          alt="Bubble.io Search Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
};

export default PreviewImage;
