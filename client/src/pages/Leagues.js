import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Users, Calendar, Search } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Leagues = () => {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await axios.get('/api/league/public');
      console.log('Fetched leagues:', response.data);
      console.log('First league members:', response.data.leagues[0]?.members);
      setLeagues(response.data.leagues);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinLeague = async (league) => {
    try {
      await axios.post(`/api/league/${league._id}/join`);
      toast.success('Successfully joined the league!');
      fetchLeagues(); // Refresh the list
    } catch (error) {
      console.error('Error joining league:', error);
      toast.error(error.response?.data?.message || 'Failed to join league');
    }
  };

  const filteredLeagues = leagues.filter(league =>
    league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Fantasy Leagues</h1>
            <p className="text-dark-300">Join or create a fantasy DCI league</p>
          </div>
          <Link
            to="/leagues/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create League
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Leagues Grid */}
        {filteredLeagues.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No leagues found' : 'No leagues available'}
            </h3>
            <p className="text-dark-300 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Be the first to create a league!'
              }
            </p>
            {!searchTerm && (
              <Link
                to="/leagues/create"
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First League
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map((league) => (
              <div
                key={league._id}
                className="bg-dark-800 rounded-lg border border-dark-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {league.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    league.status === 'active' 
                      ? 'bg-green-600 text-green-100' 
                      : 'bg-dark-600 text-dark-300'
                  }`}>
                    {league.status}
                  </span>
                </div>

                <p className="text-dark-300 mb-4 line-clamp-2">
                  {league.description || 'No description available'}
                </p>

                <div className="flex items-center text-sm text-dark-300 mb-2">
                  <Users className="w-4 h-4 mr-1" />
                  {league.members?.length || 0} members
                </div>

                <div className="flex items-center text-sm text-dark-300 mb-4">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(league.createdAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  {league.members?.some(member => 
                    (typeof member.user === 'object' ? member.user._id : member.user) === user?._id
                  ) ? (
                    <Link
                      to={`/leagues/${league._id}`}
                      className="flex-1 text-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                    >
                      View League
                    </Link>
                  ) : (
                    <button
                      onClick={() => joinLeague(league)}
                      className="flex-1 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                    >
                      Join League
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leagues; 