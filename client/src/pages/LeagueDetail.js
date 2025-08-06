import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Calendar, Settings, Play, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeagueDetail = () => {
  const { leagueId } = useParams();
  const { user } = useAuth();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showScores, setShowScores] = useState(false);
  const [memberScores, setMemberScores] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    fetchLeagueDetails();
  }, [leagueId]);

  const fetchLeagueDetails = async () => {
    try {
      const response = await axios.get(`/api/league/${leagueId}`);
      const data = response.data.league;
      setLeague(data);
    } catch (error) {
      console.error('Error fetching league details:', error);
    } finally {
      setLoading(false);
    }
  };



  const startDraft = async () => {
    try {
      // Update league status to drafting
      await axios.put(`/api/league/${leagueId}`, { 
        status: 'drafting'
      });
      
      // Refresh league data
      fetchLeagueDetails();
      
      // Redirect to draft page
      window.location.href = `/draft/${leagueId}`;
    } catch (error) {
      console.error('Error starting draft:', error);
      toast.error('Failed to start draft');
    }
  };

  const resetDraft = async () => {
    // Confirm before resetting
    const confirmed = window.confirm('Are you sure you want to reset the draft? This will clear all picks and cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await axios.put(`/api/league/${leagueId}`, {
        status: 'setup',
        draftResults: null
      });
      
      fetchLeagueDetails();
      toast.success('Draft reset! You can start a new draft.');
    } catch (error) {
      console.error('Error resetting draft:', error);
      toast.error('Failed to reset draft');
    }
  };

  const calculateScores = async () => {
    if (!league.draftResults) {
      toast.error('No draft results to calculate scores');
      return;
    }

    // Check if draft results are in the expected format
    const draftResultsKeys = Object.keys(league.draftResults);
    if (draftResultsKeys.length === 0) {
      toast.error('Draft results are empty');
      return;
    }

    setLoadingScores(true);
    try {
      const response = await axios.post('/api/scores/calculate', {
        draftResults: league.draftResults
      });

      if (response.data.success) {
        setMemberScores(response.data.data.memberScores);
        setLeaderboard(response.data.data.leaderboard);
        setShowScores(true);
        toast.success('Scores calculated successfully!');
      } else {
        toast.error(response.data.message || 'Failed to calculate scores');
      }
    } catch (error) {
      console.error('Error calculating scores:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to calculate scores: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoadingScores(false);
    }
  };

  const getMemberName = (memberId) => {
    const member = league.members?.find(m => 
      (typeof m.user === 'object' ? m.user._id : m.user) === memberId
    );
    return member ? (typeof member.user === 'object' ? member.user.username : 'Unknown') : 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">League not found</div>
      </div>
    );
  }

  const isOwner = league.commissioner?._id === user?._id;
  const isMember = league.members?.some(member => 
    (typeof member.user === 'object' ? member.user._id : member.user) === user?._id
  );
  
  // Debug logging
  console.log('League status:', league.status);
  console.log('User ID:', user?._id);
  console.log('Commissioner ID:', league.commissioner?._id);
  console.log('Is owner:', isOwner);

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/leagues"
            className="inline-flex items-center text-dark-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Leagues
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{league.name}</h1>
              <p className="text-dark-300">{league.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              {isOwner && league.status === 'setup' && (
                <button
                  onClick={startDraft}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Draft
                </button>
              )}
              {isOwner && (league.status === 'drafting' || league.status === 'completed') && (
                <button
                  onClick={resetDraft}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Reset Draft
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* League Info */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">League Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-dark-300">
                  <Users className="w-5 h-5 mr-2" />
                  {league.members?.length || 0} members
                </div>
                <div className="flex items-center text-dark-300">
                  <Calendar className="w-5 h-5 mr-2" />
                  Created {new Date(league.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  league.status === 'active' 
                    ? 'bg-green-600 text-green-100' 
                    : league.status === 'drafting'
                    ? 'bg-blue-600 text-blue-100'
                    : 'bg-dark-600 text-dark-300'
                }`}>
                  {league.status}
                </span>
              </div>
            </div>

            {/* Members */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {league.members?.map((member) => {
                  const user = typeof member.user === 'object' ? member.user : null;
                  const memberId = user?._id || member.user;
                  const isCommissioner = league.commissioner?._id === memberId;
                  
                  return (
                    <div key={memberId} className="flex items-center p-3 bg-dark-700 rounded-lg">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-white font-medium">
                          {user?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-dark-300">
                          {isCommissioner ? 'Commissioner' : 'Member'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Draft Actions */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Play className="w-5 h-5 text-primary-400 mr-2" />
                <h2 className="text-xl font-semibold text-white">Draft Actions</h2>
              </div>

              {isOwner && league.status === 'setup' && (
                <button
                  onClick={startDraft}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Start Draft
                </button>
              )}

              {isOwner && (league.status === 'drafting' || league.status === 'completed') && (
                <button
                  onClick={resetDraft}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors mb-2"
                >
                  Reset Draft
                </button>
              )}

              {league.status === 'drafting' && (
                <Link
                  to={`/draft/${leagueId}`}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-center block"
                >
                  Continue Draft
                </Link>
              )}

              {league.status === 'completed' && (
                <div className="text-center">
                  <p className="text-green-400 text-sm mb-2">✓ Draft Completed</p>
                  <Link
                    to={`/draft/${leagueId}`}
                    className="text-primary-400 hover:text-primary-300 text-sm"
                  >
                    View Draft Results
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Draft Results - Show Teams After Draft */}
          {league.draftResults && (
            <div className="bg-dark-800 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-medium text-white mb-4">Draft Results - Member Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {league.members?.map((member) => {
                  const memberId = typeof member.user === 'object' ? member.user._id : member.user;
                  const username = typeof member.user === 'object' ? member.user.username : 'Unknown';
                  
                  // Get this member's picks from draft results
                  const memberPicks = {};
                  const captionMap = {
                    'ge1': 'General Effect 1',
                    'ge2': 'General Effect 2',
                    'visualproficiency': 'Visual Proficiency',
                    'visualanalysis': 'Visual Analysis',
                    'colorguard': 'Color Guard',
                    'musicbrass': 'Music Brass',
                    'musicanalysis': 'Music Analysis',
                    'musicpercussion': 'Music Percussion'
                  };
                  
                  // Check each caption for this member's picks
                  Object.keys(captionMap).forEach(captionKey => {
                    if (league.draftResults[captionKey]) {
                      const pick = league.draftResults[captionKey].find(pick => pick.member === memberId);
                      if (pick) {
                        memberPicks[captionMap[captionKey]] = pick.corps;
                      }
                    }
                  });

                  return (
                    <div key={memberId} className="bg-dark-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">{username}'s Team</h4>
                      <div className="space-y-2">
                        {Object.keys(memberPicks).map(caption => (
                          <div key={caption} className="flex justify-between text-sm">
                            <span className="text-dark-300">{caption}:</span>
                            <span className="text-white">{memberPicks[caption]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fantasy Scores Section */}
          {league.draftResults && (
            <div className="bg-dark-800 rounded-lg p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Fantasy Scores</h3>
                <button
                  onClick={calculateScores}
                  disabled={loadingScores}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white text-sm rounded-lg transition-colors"
                >
                  {loadingScores ? 'Calculating...' : 'Calculate Scores'}
                </button>
              </div>

              {showScores && leaderboard.length > 0 ? (
                <div className="space-y-4">
                  {/* Leaderboard */}
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-3">Leaderboard</h4>
                    <div className="space-y-2">
                      {leaderboard.map((entry, index) => (
                        <div key={entry.memberId} className="flex justify-between items-center p-3 bg-dark-700 rounded-lg">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold mr-3 ${
                              index === 0 ? 'text-yellow-400' : 
                              index === 1 ? 'text-gray-300' : 
                              index === 2 ? 'text-amber-600' : 'text-white'
                            }`}>
                              #{index + 1}
                            </span>
                            <div>
                              <div className="text-white font-medium">{getMemberName(entry.memberId)}</div>
                              <div className="text-dark-400 text-xs">
                                {Object.keys(entry.picks).map(caption => 
                                  `${caption}: ${entry.picks[caption]}`
                                ).join(', ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-lg">{entry.totalScore.toFixed(3)}</div>
                            <div className="text-dark-400 text-xs">Total Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div>
                    <h4 className="text-sm font-medium text-dark-300 mb-3">Score Breakdown</h4>
                    <div className="space-y-3">
                      {Object.keys(memberScores).map(memberId => {
                        const memberScore = memberScores[memberId];
                        return (
                          <div key={memberId} className="bg-dark-700 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium">{getMemberName(memberId)}</span>
                              <span className="text-primary-400 font-bold">{memberScore.totalScore.toFixed(3)}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                              {Object.keys(memberScore.breakdown).map(caption => {
                                if (caption === 'total') return null;
                                const breakdown = memberScore.breakdown[caption];
                                return (
                                  <div key={`${memberId}-${caption}`} className="bg-dark-600 rounded p-2">
                                    <div className="text-dark-300 capitalize">{caption}</div>
                                    <div className="text-white font-medium">{breakdown.corps}</div>
                                    <div className="text-primary-400">{breakdown.score.toFixed(3)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-dark-300 mb-3">Click "Calculate Scores" to see fantasy standings</p>
                  <p className="text-dark-400 text-sm">Scores are based on real DCI performance data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetail; 