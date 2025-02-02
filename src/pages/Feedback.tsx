import React from "react";
import Header from "@/components/Header";
import FeedbackForm from "@/components/feedback/FeedbackForm";

const Feedback = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-8">
        <Header
          title="Provide Feedback"
          description="Help us improve by sharing your thoughts"
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Submit Feedback</h2>
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
};

export default Feedback;