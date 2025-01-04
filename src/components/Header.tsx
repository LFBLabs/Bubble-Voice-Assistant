import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  title: string;
  description: string;
}

const Header = ({ title, description }: HeaderProps) => {
  return (
    <header className="text-center mb-12">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => supabase.auth.signOut()}
          className="text-sm"
        >
          Sign Out
        </Button>
      </div>
      <h1 className="text-4xl font-bold text-primary mb-4">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </header>
  );
};

export default Header;