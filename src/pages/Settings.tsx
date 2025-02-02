import React from 'react';
import Header from "@/components/Header";
import PasswordChangeForm from '@/components/settings/PasswordChangeForm';
import SubscriptionStatus from '@/components/settings/SubscriptionStatus';
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-8">
        <Header
          title="Settings"
          description="Manage your account settings and preferences"
        />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-center mb-6">Subscription Status</h2>
              <SubscriptionStatus />
            </div>

            <Separator className="my-8" />

            <div>
              <h2 className="text-2xl font-semibold text-center mb-6">Change Password</h2>
              <PasswordChangeForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;