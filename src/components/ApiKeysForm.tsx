import React from "react";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeysFormProps {
  geminiKey: string;
  setGeminiKey: (key: string) => void;
  awsAccessKey: string;
  setAwsAccessKey: (key: string) => void;
  awsSecretKey: string;
  setAwsSecretKey: (key: string) => void;
  session: any;
}

const ApiKeysForm = ({
  geminiKey,
  setGeminiKey,
  awsAccessKey,
  setAwsAccessKey,
  awsSecretKey,
  setAwsSecretKey,
  session,
}: ApiKeysFormProps) => {
  const { toast } = useToast();

  const saveKeys = async () => {
    try {
      const { data: existingKeys, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingKeys) {
        const { error } = await supabase
          .from('api_keys')
          .update({
            gemini_key: geminiKey,
            aws_access_key: awsAccessKey,
            aws_secret_key: awsSecretKey,
          })
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_keys')
          .insert([
            {
              user_id: session.user.id,
              gemini_key: geminiKey,
              aws_access_key: awsAccessKey,
              aws_secret_key: awsSecretKey,
            },
          ]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Your API keys have been saved securely.",
      });
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Error",
        description: "Failed to save API keys",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Gemini API Key</label>
        <Input
          type="password"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder="Enter Gemini API Key"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">AWS Access Key</label>
        <Input
          type="password"
          value={awsAccessKey}
          onChange={(e) => setAwsAccessKey(e.target.value)}
          placeholder="Enter AWS Access Key"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">AWS Secret Key</label>
        <Input
          type="password"
          value={awsSecretKey}
          onChange={(e) => setAwsSecretKey(e.target.value)}
          placeholder="Enter AWS Secret Key"
        />
      </div>
      <Button onClick={saveKeys} className="w-full">
        <Key className="w-4 h-4 mr-2" />
        Save API Keys
      </Button>
    </div>
  );
};

export default ApiKeysForm;