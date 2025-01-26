import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, User, Smile } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <div className="hidden md:flex space-x-8">
              <a href="#" className="hover:text-purple-400 transition-colors">Home</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Mint NFT</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Ranking</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Staking</a>
              <a href="#" className="hover:text-purple-400 transition-colors">How to run</a>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-[#9B87F5] hover:bg-[#7E69AB] text-white px-6 py-2 rounded-full transition-colors"
          >
            Connect Wallet
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Sentient AI Functionalities</h1>
          <p className="text-xl text-gray-300 mb-12">
            Unlock all functionalities once agents complete the bonding curve.
          </p>

          {/* Progress Bar */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-[#2A2D3A] rounded-full p-1">
              <div className="flex items-center">
                <div className="bg-[#9B87F5] text-sm px-4 py-2 rounded-l-full">
                  Fun
                </div>
                <div className="flex-1 bg-[#9B87F5] h-10 rounded-r-full flex items-center px-4">
                  Sentient Agents
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8" />}
              title="Forum Chat"
            />
            <FeatureCard
              icon={<Send className="h-8 w-8" />}
              title="X Post"
            />
            <FeatureCard
              icon={<User className="h-8 w-8" />}
              title="Sentient AI"
            />
            <FeatureCard
              icon={<Smile className="h-8 w-8" />}
              title="Meme Gen"
            />
          </div>

          {/* Search Bar */}
          <div className="mt-16 max-w-md mx-auto flex gap-4">
            <input
              type="text"
              placeholder="Colm ectwallet"
              className="flex-1 bg-[#2A2D3A] border border-[#9B87F5]/20 rounded-full px-6 py-3 focus:outline-none focus:border-[#9B87F5]"
            />
            <Button 
              className="bg-[#9B87F5] hover:bg-[#7E69AB] text-white px-6 py-2 rounded-full transition-colors"
            >
              Colm ectwallet
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="bg-[#2A2D3A] p-8 rounded-xl flex flex-col items-center justify-center space-y-4 hover:bg-[#2A2D3A]/80 transition-colors cursor-pointer">
    <div className="text-[#9B87F5]">
      {icon}
    </div>
    <h3 className="text-lg font-medium">{title}</h3>
  </div>
);

export default Landing;