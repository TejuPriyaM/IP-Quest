import React from 'react';
import { IPQuestBadge } from './IPQuestBadge';

export const LegalDisclaimerModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          title="Close Notice"
        >
          ✕
        </button>

        <div className="flex items-center gap-3.5">
          <IPQuestBadge size={52} className="shadow-xs" />
          <div>
            <h3 className="text-xl font-black text-[#0e2038] font-display">Educational Notice & Safety</h3>
            <span className="text-xs text-amber-700 font-bold">Explore • Learn • Build a Safer Tomorrow</span>
          </div>
        </div>

        <div className="p-4 bg-[#f0f7fc] rounded-2xl border-2 border-sky-200 text-xs text-slate-700 space-y-3 leading-relaxed shadow-xs">
          <p>
            <strong className="text-amber-800">Educational Purpose:</strong> This game and platform teach foundational concepts of Intellectual Property (Patents, Copyrights, Trademarks, Trade Secrets, and Academic Integrity) exclusively for school students and educational simulations.
          </p>
          <p>
            <strong className="text-emerald-800">Not Legal Advice:</strong> None of the scenarios, mini-games, rules, or outcomes in this platform constitute formal legal advice. Real-world intellectual property statutes, application procedures, patentability thresholds, and copyright terms vary across international jurisdictions and individual situations.
          </p>
          <p>
            <strong className="text-sky-800">Terminology:</strong> Educational explanations intentionally use qualifying language such as <em>"can be protected by"</em>, <em>"may qualify for"</em>, and <em>"generally applies to"</em> to accurately reflect the flexible nature of property law.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs border border-yellow-200 transition-all hover:scale-105 cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
