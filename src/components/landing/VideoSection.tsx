
import React from "react";
import { supabase } from "@/integrations/supabase/client";

const VideoSection = () => {
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getVideoUrl = async () => {
      const { data: { publicUrl } } = supabase
        .storage
        .from('lovable-uploads')
        .getPublicUrl('demo.mp4');
      
      setVideoUrl(publicUrl);
    };

    getVideoUrl();
  }, []);

  if (!videoUrl) {
    return null; // Don't render anything until we have the video URL
  }

  return (
    <div className="max-w-4xl mx-auto mb-20">
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <video 
          className="w-full h-full rounded-xl" 
          controls
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoSection;
