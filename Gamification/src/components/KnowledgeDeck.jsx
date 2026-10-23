import React, { useState } from 'react';
import { IP_COLLECTIBLE_CARDS } from '../data/ipContent';
import { soundFx } from '../utils/sound';
import { BookOpen, Sparkles, HelpCircle, ChevronDown, ChevronUp, Lock, Lightbulb, Feather, ShieldCheck, ShieldAlert, GraduationCap } from 'lucide-react';

const ICON_MAP = {
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  Feather: <Feather className="w-6 h-6" />,
  ShieldCheck: <ShieldCheck className="w-6 h-6" />,
  Lock: <ShieldAlert className="w-6 h-6" />,
  GraduationCap: <GraduationCap className="w-6 h-6" />
};

export const KnowledgeDeck = ({ collectedCardIds, onBack }) => {
  const [selectedCard, setSelectedCard] = useState(IP_COLLECTIBLE_CARDS[0]);
  const [expandedLayer3, setExpandedLayer3] = useState(false);

  const handleSelectCard = (card) => {
    soundFx.playClick();
    setSelectedCard(card);
    setExpandedLayer3(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Knowledge Library</span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-300">Collectible IP Cards</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">IP Knowledge Deck</h2>
              <p className="text-sm text-slate-300">
                Explore the 3-Layer explanation model: Simple Definition → Everyday Example → Deep Dive.
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Card Deck Selector */}
        <div className="md:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Collected Cards ({collectedCardIds.length}/{IP_COLLECTIBLE_CARDS.length})
          </span>

          <div className="space-y-2.5">
            {IP_COLLECTIBLE_CARDS.map(card => {
              const isUnlocked = collectedCardIds.includes(card.id) || card.id === 'card_patent';
              const isSelected = selectedCard.id === card.id;

              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-750 border-amber-400 ring-1 ring-amber-400 text-white'
                      : isUnlocked
                      ? 'bg-slate-850 border-slate-700 hover:border-slate-600 text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-gradient-to-tr text-white ' + card.color : 'bg-slate-800 text-slate-600'
                  }`}>
                    {isUnlocked ? ICON_MAP[card.icon] || <Sparkles className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate flex items-center justify-between">
                      <span>{card.title}</span>
                      {isUnlocked && (
                        <span className="text-[10px] text-amber-400 uppercase font-semibold">Unlocked</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{card.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Card Detailed 3-Layer View */}
        <div className="md:col-span-7 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-slate-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  {selectedCard.concept.toUpperCase().replace('_', ' ')}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">{selectedCard.badge}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mt-1">{selectedCard.title}</h3>
              <p className="text-xs text-slate-300">{selectedCard.subtitle}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr shadow-lg ${selectedCard.color}`}>
              {ICON_MAP[selectedCard.icon] || <Sparkles className="w-7 h-7" />}
            </div>
          </div>

          {/* LAYER 1: ONE SENTENCE DEFINITION */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Layer 1 · What does it mean? (One Sentence)
            </span>
            <p className="text-sm text-slate-100 font-medium leading-relaxed">
              {selectedCard.layer1Definition}
            </p>
          </div>

          {/* LAYER 2: REAL-WORLD EXAMPLE */}
          <div className="p-4 bg-slate-850 rounded-xl border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Layer 2 · Everyday Example
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {selectedCard.layer2Example}
            </p>
          </div>

          {/* LAYER 3: DEEP DIVE ("Tell Me More") */}
          <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-850">
            <button
              onClick={() => {
                soundFx.playClick();
                setExpandedLayer3(!expandedLayer3);
              }}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Layer 3 · Tell Me More (Deeper Legal Nuance)
                </span>
              </div>
              {expandedLayer3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {expandedLayer3 && (
              <div className="p-4 pt-1 border-t border-slate-750 text-xs text-slate-300 leading-relaxed bg-slate-900/60">
                {selectedCard.layer3DeepDive}
              </div>
            )}
          </div>

          {/* Fun Fact */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <span className="font-bold text-amber-300">Historical Fun Fact: </span>
              {selectedCard.funFact}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
