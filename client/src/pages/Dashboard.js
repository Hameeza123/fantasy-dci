import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Plus, Users, Calendar } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLeagues();
  }, []);

  const fetchUserLeagues = async () => {
    try {
      const response = await axios.get('/api/league/my-leagues');
      setLeagues(response.data.leagues);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-dark-300">
            Manage your fantasy DCI leagues and drafts
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/leagues"
            className="p-6 bg-dark-800 rounded-lg border border-dark-700 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Join a League</h3>
                <p className="text-dark-300">Find and join existing leagues</p>
              </div>
              <Trophy className="w-8 h-8 text-primary-400" />
            </div>
          </Link>

          <Link
            to="/leagues/create"
            className="p-6 bg-dark-800 rounded-lg border border-dark-700 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Create League</h3>
                <p className="text-dark-300">Start a new fantasy league</p>
              </div>
              <Plus className="w-8 h-8 text-primary-400" />
            </div>
          </Link>
        </div>

        {/* User's Leagues */}
        <div className="bg-dark-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Your Leagues</h2>
          
          {leagues.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <p className="text-dark-300 mb-4">You haven't joined any leagues yet</p>
              <Link
                to="/leagues"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Join a League
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <div
                  key={league._id}
                  className="p-4 bg-dark-700 rounded-lg border border-dark-600"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {league.name}
                  </h3>
                  <div className="flex items-center text-sm text-dark-300 mb-2">
                    <Users className="w-4 h-4 mr-1" />
                    {league.members?.length || 0} members
                  </div>
                  <div className="flex items-center text-sm text-dark-300 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(league.createdAt).toLocaleDateString()}
                  </div>
                  <Link
                    to={`/leagues/${league._id}`}
                    className="inline-flex items-center px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                  >
                    View League
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 