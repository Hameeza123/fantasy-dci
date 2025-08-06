import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Trophy, Star, TrendingUp, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Corps = () => {
  const [corps, setCorps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');

  useEffect(() => {
    fetchCorps();
  }, []);

  const fetchCorps = async () => {
    try {
      const response = await axios.get('/api/corps');
      setCorps(response.data.corps);
    } catch (error) {
      console.error('Error fetching corps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCorps = corps.filter(corps => {
    const matchesSearch = corps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         corps.abbreviation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = selectedDivision === 'all' || corps.division === selectedDivision;
    return matchesSearch && matchesDivision;
  });

  const getSectionScore = (corps, section) => {
    return corps.sections[section]?.score || 0;
  };

  const getSectionColor = (section) => {
    const colors = {
      brass: 'text-brass',
      percussion: 'text-percussion',
      guard: 'text-guard',
      visual: 'text-visual',
      generalEffect: 'text-generalEffect'
    };
    return colors[section] || 'text-white';
  };

  const getSectionIcon = (section) => {
    const icons = {
      brass: '🎺',
      percussion: '🥁',
      guard: '🎭',
      visual: '👁️',
      generalEffect: '⭐'
    };
    return icons[section] || '🎵';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-dark-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">DCI Corps</h1>
          <p className="text-dark-300">
            Browse and compare Drum Corps International corps performance
          </p>
        </div>

        {/* Filters */}
        <div className="bg-dark-800 rounded-lg border border-dark-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search corps..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Division Filter */}
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Divisions</option>
              <option value="World Class">World Class</option>
              <option value="Open Class">Open Class</option>
              <option value="All-Age">All-Age</option>
            </select>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Sections</option>
              <option value="brass">Brass</option>
              <option value="percussion">Percussion</option>
              <option value="guard">Guard</option>
              <option value="visual">Visual</option>
              <option value="generalEffect">General Effect</option>
            </select>
          </div>
        </div>

        {/* Corps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCorps.map((corps) => (
            <div
              key={corps._id}
              className="bg-dark-800 rounded-lg border border-dark-700 p-6 hover:border-primary-500 transition-colors"
            >
              {/* Corps Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{corps.name}</h3>
                  <p className="text-sm text-dark-300">{corps.abbreviation}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-400">
                    {corps.totalScore?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-dark-300">Total Score</div>
                </div>
              </div>

              {/* Division Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  corps.division === 'World Class' 
                    ? 'bg-primary-100 text-primary-800' 
                    : corps.division === 'Open Class'
                    ? 'bg-secondary-100 text-secondary-800'
                    : 'bg-dark-100 text-dark-800'
                }`}>
                  {corps.division}
                </span>
              </div>

              {/* Section Scores */}
              <div className="space-y-3">
                {Object.entries(corps.sections).map(([section, data]) => (
                  <div key={section} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{getSectionIcon(section)}</span>
                      <span className={`text-sm font-medium capitalize ${getSectionColor(section)}`}>
                        {section === 'generalEffect' ? 'GE' : section}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {data.score?.toFixed(1) || '0.0'}
                      </div>
                      {data.rank && (
                        <div className="text-xs text-dark-300">
                          #{data.rank}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Location */}
              {corps.location && (
                <div className="mt-4 pt-4 border-t border-dark-600">
                  <p className="text-sm text-dark-300">
                    📍 {corps.location.city}, {corps.location.state}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCorps.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No corps found</h3>
            <p className="text-dark-300">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Corps; 