import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

type FeedbackType = "general" | "bug" | "feature";

interface FeedbackForm {
  type: FeedbackType;
  content: string;
}

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, watch } = useForm<FeedbackForm>({
    defaultValues: {
      type: "general",
      content: "",
    },
  });

  const onSubmit = async (data: FeedbackForm) => {
    try {
      const { error } = await supabase
        .from("feedback")
        .insert([
          {
            type: data.type,
            content: data.content,
          },
        ]);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <Header
          title="Provide Feedback"
          description="Help us improve by sharing your thoughts"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <Label>Type of Feedback</Label>
            <RadioGroup
              defaultValue="general"
              {...register("type")}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
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

          <div className="space-y-2">
            <Label htmlFor="content">Your Feedback</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Please share your thoughts..."
              className="min-h-[150px]"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Feedback</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;