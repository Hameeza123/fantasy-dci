import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateLeague = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/league', formData);
      toast.success('League created successfully!');
      navigate(`/leagues/${response.data.league._id}`);
    } catch (error) {
      console.error('Error creating league:', error);
      toast.error(error.response?.data?.message || 'Failed to create league');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/leagues"
            className="inline-flex items-center text-dark-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">Create New League</h1>
          <p className="text-dark-300">Start a new fantasy DCI league</p>
        </div>

        {/* Form */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                League Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                placeholder="Enter league name"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
                placeholder="Describe your league (optional)"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  'Creating...'
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create League
                  </>
                )}
              </button>
              
              <Link
                to="/leagues"
                className="px-4 py-2 border border-dark-600 text-dark-300 hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLeague; 