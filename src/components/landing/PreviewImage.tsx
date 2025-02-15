
import React from "react";

const PreviewImage = () => {
  return (
    <div className="space-y-8 hidden sm:block mb-20 max-w-6xl mx-auto">
      {/* First Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/e6dbb73e-ed4f-4a92-b4b1-f21d28807042.png"
          alt="Bubble.io Task Flow Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>

      {/* Second Image */}
      <div className="relative rounded-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0037ff]/10 to-transparent pointer-events-none"></div>
        <img
          src="/lovable-uploads/0ac88ef3-19e1-4ce2-90cb-d480accdfe4a.png"
          alt="Bubble.io Employee Search Interface"
          className="w-full object-cover rounded-xl shadow-lg"
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
};

export default PreviewImage;
