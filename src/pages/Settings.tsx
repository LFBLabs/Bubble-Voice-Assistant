import React from 'react';
import Header from "@/components/Header";
import PasswordChangeForm from '@/components/settings/PasswordChangeForm';

const Settings = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="space-y-8">
        <Header
          title="Settings"
          description="Manage your account settings and preferences"
        />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-8">Change Password</h2>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
};

export default Settings;