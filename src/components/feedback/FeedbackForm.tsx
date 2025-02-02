import React from 'react';
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type FeedbackType = "general" | "bug" | "feature";

interface FeedbackForm {
  type: FeedbackType;
  content: string;
}

const FeedbackForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit } = useForm<FeedbackForm>({
    defaultValues: {
      type: "general",
      content: "",
    },
  });

  const onSubmit = async (data: FeedbackForm) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("feedback")
        .insert({
          type: data.type,
          content: data.content,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input and will review it shortly.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-medium">Type of Feedback</Label>
          <RadioGroup
            defaultValue="general"
            {...register("type")}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="general" id="general" />
              <Label htmlFor="general">General Feedback</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bug" id="bug" />
              <Label htmlFor="bug">Bug Report</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="feature" id="feature" />
              <Label htmlFor="feature">Feature Request</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="content" className="text-lg font-medium">Your Feedback</Label>
          <Textarea
            id="content"
            {...register("content")}
            placeholder="Please share your thoughts..."
            className="min-h-[150px] mt-2"
          />
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/")}
          className="min-w-[120px]"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="min-w-[120px]"
        >
          Submit Feedback
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;