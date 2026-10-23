import React, { useState, useEffect } from 'react';
import { IP_COLLECTIBLE_CARDS } from './data/ipContent';
import { soundFx } from './utils/sound';
import { HeaderNav } from './components/HeaderNav';
import { IPQuestBadge } from './components/IPQuestBadge';
import { Realtime3DGame } from './components/games/Realtime3DGame';
import { PatentLabGame } from './components/games/PatentLabGame';
import { CreatorStudioGame } from './components/games/CreatorStudioGame';
import { BrandCityGame } from './components/games/BrandCityGame';
import { SecretVaultGame } from './components/games/SecretVaultGame';
import { OriginalityAcademyGame } from './components/games/OriginalityAcademyGame';
import { StudentConceptModal } from './components/StudentConceptModal';
import { LegalDisclaimerModal } from './components/LegalDisclaimerModal';
import { StudentQuickMission } from './components/games/StudentQuickMission';
import { EasyConceptMatcher } from './components/games/EasyConceptMatcher';
import { TrueFalseLightningGame } from './components/games/TrueFalseLightningGame';
import { CrossConceptGame } from './components/games/CrossConceptGame';
import { IPDropCatcherGame } from './components/games/IPDropCatcherGame';
import { IPMemoryFlipGame } from './components/games/IPMemoryFlipGame';
import { IPLockerMiniGame } from './components/games/IPLockerMiniGame';
import { StudentArcadeHub } from './components/games/StudentArcadeHub';
import { TeacherDashboard } from './components/TeacherDashboard';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'ip_quest_player_stats_v1';

const INITIAL_STATS= {
  xp: 140,
  level: 1,
  coins: 45,
  stars: 3,
  streak: 3,
  lastDailyDate: null,
  unlockedRegions: ['patent', 'copyright', 'trademark', 'trade_secret', 'plagiarism'],
  completedMissions: [],
  collectedCards: ['card_patent'],
  badges: ['Patent Pioneer'],
  soundEnabled: true,
  difficulty: 'intermediate',
  analytics: {
    attemptsByConcept: {
      patent: 4,
      copyright: 3,
      trademark: 3,
      trade_secret: 2,
      plagiarism: 3
    },
    correctByConcept: {
      patent: 3,
      copyright: 3,
      trademark: 2,
      trade_secret: 2,
      plagiarism: 3
    },
    hintsUsed: 2,
    confusions: {},
    timeSpentSeconds: 480,
    lastActiveDate: new Date().toISOString()
  }
};

export default function App() {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_STATS;
  });

  const [currentRealm, setCurrentRealm] = useState('patent');
  const [gameMode, setGameMode] = useState('2d');
  const [showConceptsGuideModal, setShowConceptsGuideModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [levelUpAlert, setLevelUpAlert] = useState(null);

  // Save stats on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Sync sound manager state
  useEffect(() => {
    soundFx.setMuted(!stats.soundEnabled);
  }, [stats.soundEnabled]);

  const toggleSound = () => {
    const updated = !stats.soundEnabled;
    soundFx.setMuted(!updated);
    setStats(prev => ({ ...prev, soundEnabled: updated }));
    if (updated) {
      soundFx.playClick();
    }
  };

  const getRankTitle = ( lvl) => {
    switch (lvl) {
      case 1: return 'Junior Explorer';
      case 2: return 'Innovation Scout';
      case 3: return 'Creative Pioneer';
      case 4: return 'Brand Guardian';
      case 5: return 'Master IP Defender';
      default: return 'Grand Guardian of Innovation';
    }
  };

  const addRewards = ( xpEarned, coinsEarned, starsEarned, concept) => {
    setStats(prev => {
      const newXp = prev.xp + xpEarned;
      const newCoins = prev.coins + coinsEarned;
      const newStars = prev.stars + starsEarned;
      const newLevel = Math.max(1, Math.floor(newXp / 150) + 1);

      // Trigger level-up fanfare if leveled up
      if (newLevel > prev.level) {
        soundFx.playLevelUp();
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 } });
        setLevelUpAlert({
          newLevel,
          rankTitle: getRankTitle(newLevel)
        });
      }

      const updatedCards = [...prev.collectedCards];
      if (concept) {
        const cardMatch = IP_COLLECTIBLE_CARDS.find(c => c.concept === concept);
        if (cardMatch && !updatedCards.includes(cardMatch.id)) {
          updatedCards.push(cardMatch.id);
        }
      }

      const updatedAnalytics = { ...prev.analytics };
      if (concept) {
        updatedAnalytics.attemptsByConcept[concept] = (updatedAnalytics.attemptsByConcept[concept] || 0) + 1;
        updatedAnalytics.correctByConcept[concept] = (updatedAnalytics.correctByConcept[concept] || 0) + 1;
      }

      return {
        ...prev,
        xp: newXp,
        coins: newCoins,
        stars: newStars,
        level: newLevel,
        collectedCards: updatedCards,
        analytics: updatedAnalytics
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <HeaderNav
        activeRealm={currentRealm}
        activeMode={gameMode}
        onSelectRealm={realm => {
          setCurrentRealm(realm);
          if (gameMode !== '3d') {
            setGameMode('2d');
          }
        }}
        onSelectMode={setGameMode}
        stats={stats}
        onToggleSound={toggleSound}
        onOpenLegal={() => setShowLegalModal(true)}
        onOpenConceptsGuide={() => setShowConceptsGuideModal(true)}
        onOpenArcade={() => setGameMode('arcade')}
        onOpenDashboard={() => setGameMode('dashboard')}
        isDashboardActive={gameMode === 'dashboard'}
      />

      <main
        className={
          gameMode !== '3d'
            ? 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 overflow-y-auto'
            : 'flex-1 w-full h-[calc(100vh-5rem)] p-2 sm:p-3 overflow-hidden flex flex-col'
        }
      >
        {/* MODE 0: Student & Teacher Learning Dashboard */}
        {gameMode === 'dashboard' && (
          <TeacherDashboard
            stats={stats}
            onBack={() => setGameMode('2d')}
            onSelectGame={(gid, concept) => {
              if (concept) setCurrentRealm(concept);
              setGameMode(gid);
            }}
          />
        )}

        {/* MODE 0: The Full Student Arcade Hub */}
        {gameMode === 'arcade' && (
          <StudentArcadeHub
            onSelectGame={(gid, concept) => {
              if (concept) setCurrentRealm(concept);
              setGameMode(gid === 'lab' ? '2d' : gid);
            }}
            onOpenConceptsGuide={() => setShowConceptsGuideModal(true)}
            onOpenDashboard={() => setGameMode('dashboard')}
          />
        )}

        {/* MODE 1: Fast 2D Action Drop & Catch Arcade */}
        {gameMode === 'drop_catcher' && (
          <IPDropCatcherGame
            onComplete={(xp, coins, stars) => addRewards(xp, coins, stars, currentRealm)}
            onBack={() => setGameMode('arcade')}
            initialConcept={currentRealm}
          />
        )}

        {/* MODE 2: Memory Match Flip Card Game */}
        {gameMode === 'memory_flip' && (
          <IPMemoryFlipGame
            onComplete={(xp, coins, stars) => addRewards(xp, coins, stars, currentRealm)}
            onBack={() => setGameMode('arcade')}
          />
        )}

        {/* MODE 3: The IP Locker Sorter Game */}
        {gameMode === 'locker' && (
          <IPLockerMiniGame
            onComplete={(xp, coins, stars) => addRewards(xp, coins, stars, currentRealm)}
            onBack={() => setGameMode('arcade')}
          />
        )}

        {/* MODE 4: Super Simple & Fun Student Story Mission */}
        {gameMode === 'quick' && (
          <StudentQuickMission
            key={currentRealm}
            concept={currentRealm}
            onComplete={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
            onSwitchTo3D={() => setGameMode('3d')}
            onSwitchToLab={() => setGameMode('2d')}
            onSwitchToMatcher={() => setGameMode('matcher')}
            onSwitchToLightning={() => setGameMode('lightning')}
            onSwitchToArcade={() => setGameMode('arcade')}
            onSwitchToDropCatcher={() => setGameMode('drop_catcher')}
            onSwitchToMemoryFlip={() => setGameMode('memory_flip')}
          />
        )}

        {/* MODE 2: Easy Concept Matcher (1-Tap Superpower Card Game) */}
        {gameMode === 'matcher' && (
          <EasyConceptMatcher
            onComplete={(xp, coins, stars) => addRewards(xp, coins, stars, currentRealm)}
            onBack={() => setGameMode('quick')}
          />
        )}

        {/* MODE 3: Fast 1-Tap True or False Lightning Rush */}
        {gameMode === 'lightning' && (
          <TrueFalseLightningGame
            onComplete={(xp, coins, stars) => addRewards(xp, coins, stars, currentRealm)}
            onBack={() => setGameMode('quick')}
            initialConcept={currentRealm}
          />
        )}

        {/* MODE 4: School Detective Case Mystery */}
        {gameMode === 'detective' && (
          <CrossConceptGame
            onComplete={(xp, coins, stars) => addRewards(xp, coins, stars, currentRealm)}
            onBack={() => setGameMode('quick')}
          />
        )}

        {/* MODE 2: Dedicated 3D World for the Selected Realm */}
        {gameMode === '3d' && (
          <div className="w-full h-full rounded-3xl border-4 border-amber-400/90 shadow-2xl shadow-blue-950/60 overflow-hidden flex flex-col">
            <Realtime3DGame
              key={currentRealm}
              initialConcept={currentRealm}
              stats={stats}
              onCompleteMission={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
              onBack={() => setGameMode('quick')}
              onSwitchTo2D={() => setGameMode('2d')}
              onSwitchRealm={nextRealm => setCurrentRealm(nextRealm)}
              onOpenDashboard={() => setGameMode('dashboard')}
            />
          </div>
        )}

        {/* MODE 3: Dedicated 10-Step Interactive Lab for the Selected Realm */}
        {gameMode === '2d' && currentRealm === 'patent' && (
          <PatentLabGame
            onComplete={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
            onBack={() => setGameMode('quick')}
            onSwitchTo3D={() => setGameMode('3d')}
            onSwitchToQuick={() => setGameMode('quick')}
          />
        )}

        {gameMode === '2d' && currentRealm === 'copyright' && (
          <CreatorStudioGame
            onComplete={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
            onBack={() => setGameMode('quick')}
            onSwitchTo3D={() => setGameMode('3d')}
            onSwitchToQuick={() => setGameMode('quick')}
          />
        )}

        {gameMode === '2d' && currentRealm === 'trademark' && (
          <BrandCityGame
            onComplete={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
            onBack={() => setGameMode('quick')}
            onSwitchTo3D={() => setGameMode('3d')}
            onSwitchToQuick={() => setGameMode('quick')}
          />
        )}

        {gameMode === '2d' && currentRealm === 'trade_secret' && (
          <SecretVaultGame
            onComplete={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
            onBack={() => setGameMode('quick')}
            onSwitchTo3D={() => setGameMode('3d')}
            onSwitchToQuick={() => setGameMode('quick')}
          />
        )}

        {gameMode === '2d' && currentRealm === 'plagiarism' && (
          <OriginalityAcademyGame
            onComplete={(xp, coins, stars, c) => addRewards(xp, coins, stars, c)}
            onBack={() => setGameMode('quick')}
            onSwitchTo3D={() => setGameMode('3d')}
            onSwitchToQuick={() => setGameMode('quick')}
          />
        )}
      </main>

      {/* Level Up Fanfare Celebration Modal with Official IP Quest Badge */}
      {levelUpAlert && (
        <div className="fixed inset-0 z-50 bg-blue-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#183d94] via-[#102766] to-[#0c1c48] border-4 border-amber-400 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            {/* The Official Adventure Badge */}
            <div className="flex justify-center">
              <IPQuestBadge size={100} className="shadow-2xl animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-amber-300 block">
                Rank Promotion Achieved
              </span>
              <h3 className="text-2xl font-black text-white font-display drop-shadow-md">
                Level {levelUpAlert.newLevel}: {levelUpAlert.rankTitle}
              </h3>
            </div>

            <p className="text-sm text-sky-100 leading-relaxed font-semibold">
              You explored the realm, learned core principles, and protected intellectual property New challenges and advanced quests are unlocked.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setLevelUpAlert(null)}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/35 border-2 border-yellow-100 cursor-pointer hover:scale-105"
              >
                Continue Adventure ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student 5 Concepts Cheat Sheet & Practice Modal */}
      <StudentConceptModal
        isOpen={showConceptsGuideModal}
        onClose={() => setShowConceptsGuideModal(false)}
        onSelectConceptGame={(concept, mode) => {
          setShowConceptsGuideModal(false);
          setCurrentRealm(concept);
          setGameMode(mode || 'quick');
        }}
      />

      {/* Legal Safety Modal */}
      {showLegalModal && (
        <LegalDisclaimerModal onClose={() => setShowLegalModal(false)} />
      )}
    </div>
  );
}
