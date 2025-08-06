import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Simple corps data - just names
const CORPS_DATA = {
  ge1: [
    'Blue Devils',
    'Carolina Crown', 
    'Bluecoats',
    'Santa Clara Vanguard',
    'The Cadets',
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  ge2: [
    'Blue Devils',
    'Carolina Crown',
    'Bluecoats', 
    'Santa Clara Vanguard',
    'The Cadets',
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  visualproficiency: [
    'Blue Devils',
    'Carolina Crown',
    'Bluecoats',
    'Santa Clara Vanguard', 
    'The Cadets',
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  visualanalysis: [
    'Blue Devils',
    'Carolina Crown',
    'Bluecoats',
    'Santa Clara Vanguard',
    'The Cadets', 
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  colorguard: [
    'Blue Devils',
    'Carolina Crown',
    'Bluecoats',
    'Santa Clara Vanguard',
    'The Cadets',
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  musicbrass: [
    'Blue Devils',
    'Carolina Crown', 
    'Bluecoats',
    'Santa Clara Vanguard',
    'The Cadets',
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  musicanalysis: [
    'Blue Devils',
    'Carolina Crown',
    'Bluecoats', 
    'Santa Clara Vanguard',
    'The Cadets',
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ],
  musicpercussion: [
    'Blue Devils',
    'Carolina Crown',
    'Bluecoats',
    'Santa Clara Vanguard',
    'The Cadets', 
    'Phantom Regiment',
    'Boston Crusaders',
    'Blue Knights',
    'The Cavaliers',
    'Madison Scouts'
  ]
};

const SECTIONS = [
  { key: 'ge1', name: 'General Effect 1', color: 'bg-purple-600' },
  { key: 'ge2', name: 'General Effect 2', color: 'bg-purple-500' },
  { key: 'visualproficiency', name: 'Visual Proficiency', color: 'bg-blue-600' },
  { key: 'visualanalysis', name: 'Visual Analysis', color: 'bg-blue-500' },
  { key: 'colorguard', name: 'Color Guard', color: 'bg-green-600' },
  { key: 'musicbrass', name: 'Music Brass', color: 'bg-red-600' },
  { key: 'musicanalysis', name: 'Music Analysis', color: 'bg-yellow-600' },
  { key: 'musicpercussion', name: 'Music Percussion', color: 'bg-orange-600' }
];

const Draft = () => {
  const { draftId } = useParams();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentRound, setCurrentRound] = useState(1);
  const [draftPicks, setDraftPicks] = useState({
    ge1: [],
    ge2: [],
    visualproficiency: [],
    visualanalysis: [],
    colorguard: [],
    musicbrass: [],
    musicanalysis: [],
    musicpercussion: []
  });
  const [isDrafting, setIsDrafting] = useState(false);
  const [selectedCorps, setSelectedCorps] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedCaption, setSelectedCaption] = useState('');
  const [selectionStep, setSelectionStep] = useState('member'); // 'member', 'caption', 'corps'
  const [showScores, setShowScores] = useState(false);
  const [memberScores, setMemberScores] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);


  useEffect(() => {
    fetchLeagueDetails();
  }, [draftId]);

  const fetchLeagueDetails = async () => {
    try {
      const response = await axios.get(`/api/league/${draftId}`);
      const leagueData = response.data.league;
      console.log('Fetched league data:', leagueData);
      console.log('League draft results:', leagueData.draftResults);
      
      setLeague(leagueData);
      setIsDrafting(leagueData.status === 'drafting');
      
      // Load existing draft picks if they exist
      if (leagueData.draftResults) {
        // Ensure all section keys are initialized
        const loadedPicks = {
          ge1: leagueData.draftResults.ge1 || [],
          ge2: leagueData.draftResults.ge2 || [],
          visualproficiency: leagueData.draftResults.visualproficiency || [],
          visualanalysis: leagueData.draftResults.visualanalysis || [],
          colorguard: leagueData.draftResults.colorguard || [],
          musicbrass: leagueData.draftResults.musicbrass || [],
          musicanalysis: leagueData.draftResults.musicanalysis || [],
          musicpercussion: leagueData.draftResults.musicpercussion || []
        };
        
        // Also handle legacy data with old section keys
        if (leagueData.draftResults.brass) {
          loadedPicks.musicbrass = leagueData.draftResults.brass;
        }
        if (leagueData.draftResults.percussion) {
          loadedPicks.musicpercussion = leagueData.draftResults.percussion;
        }
        if (leagueData.draftResults.guard) {
          loadedPicks.colorguard = leagueData.draftResults.guard;
        }
        if (leagueData.draftResults.visual) {
          loadedPicks.visualproficiency = leagueData.draftResults.visual;
        }
        if (leagueData.draftResults.general) {
          loadedPicks.ge1 = leagueData.draftResults.general;
        }
        
        setDraftPicks(loadedPicks);
      }
    } catch (error) {
      console.error('Error fetching league details:', error);
      toast.error('Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  const startDraft = async () => {
    try {
      await axios.put(`/api/league/${draftId}`, { 
        status: 'drafting'
      });
      setIsDrafting(true);
      fetchLeagueDetails();
      toast.success('Draft started!');
    } catch (error) {
      console.error('Error starting draft:', error);
      toast.error('Failed to start draft');
    }
  };

  const makePick = async () => {
    if (!selectedCorps || !selectedMember || !selectedCaption) {
      toast.error('Please complete all selections');
      return;
    }

    // Convert caption to section key
    const captionToSection = {
      'General Effect 1': 'ge1',
      'General Effect 2': 'ge2',
      'Visual Proficiency': 'visualproficiency',
      'Visual Analysis': 'visualanalysis',
      'Color Guard': 'colorguard',
      'Music Brass': 'musicbrass',
      'Music Analysis': 'musicanalysis',
      'Music Percussion': 'musicpercussion'
    };
    
    const sectionKey = captionToSection[selectedCaption];
    
    const newPicks = {
      ...draftPicks,
      [sectionKey]: [...(draftPicks[sectionKey] || []), {
        corps: selectedCorps,
        member: selectedMember,
        caption: selectedCaption,
        round: currentRound
      }]
    };
    
    setDraftPicks(newPicks);
    setSelectedCorps('');
    setSelectedMember('');
    setSelectedCaption('');
    setSelectionStep('member');
    
    // Save the pick to the league immediately
    try {
      await axios.put(`/api/league/${draftId}`, {
        draftResults: newPicks
      });
    } catch (error) {
      console.error('Error saving draft pick:', error);
      toast.error('Failed to save draft pick');
    }
    
    // Check if everyone has picked for all captions
    const membersCount = league.members?.length || 0;
    const totalPicks = Object.values(newPicks).reduce((sum, picks) => sum + picks.length, 0);
    const totalNeeded = membersCount * SECTIONS.length;
    
    console.log('Draft progress:', { totalPicks, totalNeeded, membersCount, sectionsCount: SECTIONS.length });
    console.log('Picks by section:', Object.fromEntries(
      Object.entries(newPicks).map(([key, picks]) => [key, picks.length])
    ));

    
    if (membersCount === 0) {
      toast.error('No members in league');
      return;
    }
    
    if (totalPicks >= totalNeeded) {
      // Draft complete - everyone has picked for all captions
      console.log('Draft complete! All picks made.');
      await completeDraft(newPicks);
    } else {
      // Still drafting
      console.log('Still drafting...', totalNeeded - totalPicks, 'picks remaining');
      toast.success(`${selectedCorps} ${selectedCaption} assigned to ${getMemberName(selectedMember)}`);
    }
  };

  const selectMember = (memberId) => {
    setSelectedMember(memberId);
    setSelectionStep('caption');
  };

  const selectCaption = (caption) => {
    setSelectedCaption(caption);
    setSelectionStep('corps');
  };

  const selectCorps = (corps) => {
    setSelectedCorps(corps);
  };

  const resetSelection = () => {
    setSelectedMember('');
    setSelectedCaption('');
    setSelectedCorps('');
    setSelectionStep('member');
  };

  const completeDraft = async (finalPicks) => {
    try {
      // Save draft results to league
      await axios.put(`/api/league/${draftId}`, {
        status: 'completed',
        draftResults: finalPicks
      });
      
      setIsDrafting(false);
      toast.success('Draft completed! Everyone has picked for all captions.');
      fetchLeagueDetails();
    } catch (error) {
      console.error('Error completing draft:', error);
      toast.error('Failed to complete draft');
    }
  };

  const resetDraft = async () => {
    // Confirm before resetting
    const confirmed = window.confirm('Are you sure you want to reset the draft? This will clear all picks and cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await axios.put(`/api/league/${draftId}`, {
        status: 'setup',
        draftResults: null
      });
      
      setDraftPicks({
        ge1: [],
        ge2: [],
        visualproficiency: [],
        visualanalysis: [],
        colorguard: [],
        musicbrass: [],
        musicanalysis: [],
        musicpercussion: []
      });

      setCurrentRound(1);
      setIsDrafting(false);
      resetSelection();
      
      toast.success('Draft reset! You can start a new draft.');
    } catch (error) {
      console.error('Error resetting draft:', error);
      toast.error('Failed to reset draft');
    }
  };

  const getAvailableCorps = (caption) => {
    // Convert caption to section key
    const captionToSection = {
      'General Effect 1': 'ge1',
      'General Effect 2': 'ge2',
      'Visual Proficiency': 'visualproficiency',
      'Visual Analysis': 'visualanalysis',
      'Color Guard': 'colorguard',
      'Music Brass': 'musicbrass',
      'Music Analysis': 'musicanalysis',
      'Music Percussion': 'musicpercussion'
    };
    
    const sectionKey = captionToSection[caption];
    const sectionPicks = draftPicks[sectionKey] || [];
    const draftedCorpsForCaption = sectionPicks
      .filter(pick => pick.caption === caption)
      .map(pick => pick.corps);
    
    const corpsList = CORPS_DATA[sectionKey] || [];
    return corpsList.filter(corps => !draftedCorpsForCaption.includes(corps));
  };

  const isCorpsDrafted = (corps, caption) => {
    return Object.values(draftPicks).some(sectionPicks => 
      sectionPicks.some(pick => 
        pick.corps === corps && pick.caption === caption
      )
    );
  };

  const isMemberCaptionDrafted = (memberId, caption) => {
    return Object.values(draftPicks).some(sectionPicks => 
      sectionPicks.some(pick => 
        pick.member === memberId && pick.caption === caption
      )
    );
  };

  const getMemberCaptionCorps = (memberId, caption) => {
    for (const sectionPicks of Object.values(draftPicks)) {
      const pick = sectionPicks.find(pick => 
        pick.member === memberId && pick.caption === caption
      );
      if (pick) return pick.corps;
    }
    return null;
  };

  const getMemberName = (memberId) => {
    const member = league.members?.find(m => 
      (typeof m.user === 'object' ? m.user._id : m.user) === memberId
    );
    return member ? (typeof member.user === 'object' ? member.user.username : 'Unknown') : 'Unknown';
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

    console.log('Draft results keys:', draftResultsKeys);
    console.log('Sample draft result:', league.draftResults[draftResultsKeys[0]]);

    setLoadingScores(true);
    try {
      console.log('Sending draft results:', league.draftResults);
      console.log('Auth headers:', axios.defaults.headers.common['Authorization']);
      console.log('User token:', localStorage.getItem('token'));
      
      const response = await axios.post('/api/scores/calculate', {
        draftResults: league.draftResults
      });

      console.log('Score calculation response:', response.data);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading draft...</div>
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

  const user = JSON.parse(localStorage.getItem('user'));
  console.log('User from localStorage:', user);
  console.log('League commissioner:', league.commissioner);
  const isOwner = league.commissioner?._id === user?._id;
  console.log('Is owner:', isOwner);

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/leagues/${draftId}`}
            className="inline-flex items-center text-dark-300 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to League
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{league.name} - Draft</h1>
              <p className="text-dark-300">Fantasy DCI Draft</p>
            </div>
            
            <div className="flex space-x-3">
              {!isDrafting && (
                <button
                  onClick={startDraft}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Start Draft
                </button>
              )}
              {isOwner && (
                <button
                  onClick={resetDraft}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Reset Draft
                </button>
              )}
            </div>
          </div>
        </div>

        {!isDrafting ? (
          <div className="text-center py-12">
            <p className="text-dark-300 text-lg">
              {isOwner ? 'Click "Start Draft" to begin the draft process' : 'Waiting for commissioner to start the draft'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Draft Interface */}
            <div className="lg:col-span-2">
              <div className="bg-dark-800 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Draft Board</h2>
                  {isOwner && (
                    <button
                      onClick={resetDraft}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Reset Draft
                    </button>
                  )}
                </div>
                
                {/* Draft Progress */}
                {(() => {
                  const membersCount = league.members?.length || 0;
                  const totalPicks = Object.values(draftPicks).reduce((sum, picks) => sum + picks.length, 0);
                  const totalNeeded = membersCount * SECTIONS.length;
                  const progress = totalNeeded > 0 ? (totalPicks / totalNeeded) * 100 : 0;
                  
                  return (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-dark-300 mb-2">
                        <span>Draft Progress</span>
                        <span>{totalPicks} / {totalNeeded} picks</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
                


                {/* Draft Grid */}
                <div className="mb-6">
                  


                  {/* Selection Status */}
                  {selectionStep !== 'member' && (
                    <div className="mb-4 p-3 bg-primary-900 border border-primary-600 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-dark-300">Selected: </span>
                          <span className="text-white">
                            {selectedMember && getMemberName(selectedMember)}
                            {selectedCaption && ` → ${selectedCaption}`}
                            {selectedCorps && ` → ${selectedCorps}`}
                          </span>
                        </div>
                        <button
                          onClick={resetSelection}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Draft Grid */}
                  {(() => {
                    const membersCount = league.members?.length || 0;
                    const totalPicks = Object.values(draftPicks).reduce((sum, picks) => sum + picks.length, 0);
                    const totalNeeded = membersCount * SECTIONS.length;
                    const isDraftComplete = totalPicks >= totalNeeded;
                    console.log('Draft status check:', { totalPicks, totalNeeded, isDraftComplete });
                    return !isDraftComplete;
                  })() ? (
                    <div className="space-y-4">
                      {/* Members Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {league.members?.map((member) => {
                          const memberId = typeof member.user === 'object' ? member.user._id : member.user;
                          const username = typeof member.user === 'object' ? member.user.username : 'Unknown';
                          const isSelected = selectedMember === memberId;
                          
                          return (
                            <button
                              key={memberId}
                              onClick={() => {
                                if (selectionStep === 'member') {
                                  selectMember(memberId);
                                }
                              }}
                              disabled={selectionStep !== 'member'}
                              className={`p-4 rounded-lg text-center transition-colors ${
                                isSelected
                                  ? 'bg-primary-600 text-white cursor-default'
                                  : selectionStep === 'member'
                                  ? 'bg-dark-600 hover:bg-dark-500 text-white cursor-pointer'
                                  : 'bg-dark-700 text-dark-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="font-medium">{username}</div>
                              {isSelected && selectionStep !== 'member' && (
                                <div className="text-xs opacity-75 mt-1">Selected</div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                                             {/* Caption Selection - Show when member is selected */}
                       {selectionStep === 'caption' && selectedMember && (
                         <div className="bg-dark-700 rounded-lg p-4">
                           <h4 className="text-white font-medium mb-3">
                             Select Caption for {getMemberName(selectedMember)}:
                           </h4>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                             {SECTIONS.map((section) => {
                               const isDrafted = isMemberCaptionDrafted(selectedMember, section.name);
                               
                               return (
                                 <button
                                   key={section.key}
                                   onClick={() => {
                                     if (!isDrafted) {
                                       selectCaption(section.name);
                                     }
                                   }}
                                   disabled={isDrafted}
                                   className={`p-3 rounded text-sm font-medium transition-colors ${
                                     isDrafted 
                                       ? 'bg-dark-800 text-dark-400 cursor-not-allowed'
                                       : 'bg-dark-600 hover:bg-dark-500 text-white cursor-pointer'
                                   }`}
                                 >
                                   {isDrafted ? (
                                     <div>
                                       <div className="line-through opacity-50">{section.name}</div>
                                       <div className="text-xs opacity-75">{getMemberCaptionCorps(selectedMember, section.name)}</div>
                                     </div>
                                   ) : (
                                     section.name
                                   )}
                                 </button>
                               );
                             })}
                           </div>
                         </div>
                       )}

                      {/* Corps Selection - Show when caption is selected */}
                      {selectionStep === 'corps' && selectedCaption && (
                        <div className="bg-dark-700 rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3">
                            Select Corps for {getMemberName(selectedMember)} - {selectedCaption}:
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {(() => {
                              // Convert caption to section key
                              const captionToSection = {
                                'General Effect 1': 'ge1',
                                'General Effect 2': 'ge2',
                                'Visual Proficiency': 'visualproficiency',
                                'Visual Analysis': 'visualanalysis',
                                'Color Guard': 'colorguard',
                                'Music Brass': 'musicbrass',
                                'Music Analysis': 'musicanalysis',
                                'Music Percussion': 'musicpercussion'
                              };
                              
                              const sectionKey = captionToSection[selectedCaption];
                              const corpsList = CORPS_DATA[sectionKey] || [];
                              return corpsList.map((corps) => {
                               const isDrafted = isCorpsDrafted(corps, selectedCaption);
                               let draftedBy = null;
                               for (const sectionPicks of Object.values(draftPicks)) {
                                 const pick = sectionPicks.find(pick => 
                                   pick.corps === corps && pick.caption === selectedCaption
                                 );
                                 if (pick) {
                                   draftedBy = pick;
                                   break;
                                 }
                               }
                              
                              return (
                                <button
                                  key={corps}
                                  onClick={() => {
                                    if (!isDrafted) {
                                      selectCorps(corps);
                                    }
                                  }}
                                  disabled={isDrafted}
                                  className={`p-3 rounded text-sm font-medium transition-colors ${
                                    isDrafted 
                                      ? 'bg-dark-800 text-dark-400 cursor-not-allowed'
                                      : 'bg-dark-600 hover:bg-dark-500 text-white cursor-pointer'
                                  }`}
                                >
                                  {isDrafted ? (
                                    <div>
                                      <div className="line-through opacity-50">{corps}</div>
                                      <div className="text-xs opacity-75">
                                        → {getMemberName(draftedBy.member)}
                                      </div>
                                    </div>
                                  ) : (
                                    corps
                                  )}
                                </button>
                              );
                            });
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Make Pick Button */}
                      {selectionStep === 'corps' && selectedCorps && (
                        <button
                          onClick={makePick}
                          className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                        >
                          Make Pick: {selectedCorps} {selectedCaption} → {getMemberName(selectedMember)}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-dark-300">Draft complete! Everyone has picked for all captions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Draft Summary */}
            <div className="space-y-6">
              {/* League Info */}
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">League Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-300">Status:</span>
                    <span className="text-white">{league.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Members:</span>
                    <span className="text-white">{league.members?.length || 0}</span>
                  </div>
                </div>
              </div>

              {/* Draft Picks */}
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Draft Picks</h3>
                <div className="space-y-4">
                  {SECTIONS.map((section) => (
                    <div key={section.key}>
                      <h4 className="text-sm font-medium text-dark-300 mb-2">
                        {section.name}
                      </h4>
                      <div className="space-y-2">
                        {Array.isArray(draftPicks[section.key]) ? draftPicks[section.key].map((pick, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-dark-700 rounded">
                            <div>
                              <span className="text-white text-sm">{pick.corps}</span>
                              <br />
                              <span className="text-dark-400 text-xs">
                                {pick.caption} → {getMemberName(pick.member)}
                              </span>
                            </div>
                            <span className="text-primary-400 text-sm">Round {pick.round}</span>
                          </div>
                        )) : (
                          <p className="text-dark-400 text-sm">No picks yet</p>
                        )}
                        {Array.isArray(draftPicks[section.key]) && draftPicks[section.key].length === 0 && (
                          <p className="text-dark-400 text-sm">No picks yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fantasy Scores */}
              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Fantasy Scores</h3>
                  {league.draftResults && (
                    <button
                      onClick={calculateScores}
                      disabled={loadingScores}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 text-white text-sm rounded-lg transition-colors"
                    >
                      {loadingScores ? 'Calculating...' : 'Calculate Scores'}
                    </button>
                  )}
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
                    {league.draftResults ? (
                      <div>
                        <p className="text-dark-300 mb-3">Click "Calculate Scores" to see fantasy standings</p>
                        <p className="text-dark-400 text-sm">Scores are based on real DCI performance data</p>
                      </div>
                    ) : (
                      <p className="text-dark-300">Complete the draft to calculate scores</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Draft; 