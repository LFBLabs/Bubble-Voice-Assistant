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
    <div className="container mx-auto p-4">
      <div className="space-y-8">
        <Header
          title="Provide Feedback"
          description="Help us improve by sharing your thoughts"
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Submit Feedback</h2>
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
        </div>
      </div>
    </div>
  );
};

export default Feedback;