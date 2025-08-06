import React from 'react';
import { User } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-dark-300 mb-6">
            Manage your account settings
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg">
            <User className="w-4 h-4 mr-2" />
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 