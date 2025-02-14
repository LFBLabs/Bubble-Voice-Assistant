
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings2, MessageSquarePlus, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  title: string;
  description?: string;
}

const Header = ({ title, description }: HeaderProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (systemPrefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUserEmail();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme);
  };

  const showHomeButton = location.pathname !== '/';

  return (
    <header className="text-center mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex gap-2">
          {showHomeButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="w-10 h-10"
              aria-label="Go to home page"
            >
              <Home className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="w-10 h-10"
            aria-label="Settings"
          >
            <Settings2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/feedback')}
            className="w-10 h-10"
            aria-label="Provide feedback"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {userEmail && (
            <span className="text-sm text-gray-600 dark:text-gray-300 break-all">
              {userEmail}
            </span>
          )}
          <Button
            variant="destructive"
            onClick={() => supabase.auth.signOut()}
            className="whitespace-nowrap font-semibold"
          >
            Sign Out
          </Button>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{title}</h1>
      {description && <p className="text-gray-600 dark:text-gray-300">{description}</p>}
    </header>
  );
};

export default Header;
