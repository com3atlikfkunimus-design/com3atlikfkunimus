'use client';

import { useState, useEffect } from 'react';

const ABQ_QUESTIONS = [
  {
    id: 1,
    indicator: 'Kelelahan Emosional',
    question: 'Saya merasa sangat lelah secara emosional akibat tuntutan latihan dan kompetisi olahraga yang intens.',
  },
  {
    id: 2,
    indicator: 'Depersonalisasi',
    question: 'Saya merasa tidak peduli dan acuh tak acuh terhadap hasil performa maupun perkembangan olahraga saya.',
  },
  {
    id: 3,
    indicator: 'Penurunan Prestasi',
    question: 'Saya merasa prestasi saya menurun atau tidak berkembang meskipun sudah berlatih dengan keras.',
  },
  {
    id: 4,
    indicator: 'Kehilangan Motivasi',
    question: 'Saya kehilangan semangat dan motivasi untuk terus mengikuti sesi latihan maupun kompetisi.',
  },
  {
    id: 5,
    indicator: 'Kelelahan Fisik Kronik',
    question: 'Tubuh saya terasa tegang, nyeri, atau tidak pulih sepenuhnya di antara sesi latihan.',
  },
];

const LIKERT_LABELS = [
  { value: 1, label: 'Tidak Pernah' },
  { value: 2, label: 'Jarang' },
  { value: 3, label: 'Kadang' },
  { value: 4, label: 'Sering' },
  { value: 5, label: 'Sangat Sering' },
];

/**
 * ABQQuestionnaire — Reusable Component untuk pengisian kuesioner ABQ (Pre-Test & Post-Test).
 *
 * Props:
 *   - title          : string, judul kuesioner (e.g. "Asesmen Pre-Test ABQ")
 *   - subtitle       : string, keterangan tambahan
 *   - initialAnswers : number[], array 5 integer (skor 1-5) default [0,0,0,0,0]
 *   - onSave         : function(answers, score), callback saat berhasil disimpan
 *   - isSaving       : boolean, status loading saat submit
 *   - comparisonScore: number, skor pembanding (skor Pre-test untuk kuesioner Post-test)
 */
export default function ABQQuestionnaire({
  title,
  subtitle,
  initialAnswers = [0, 0, 0, 0, 0],
  onSave,
  isSaving = false,
  comparisonScore = null,
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [totalScore, setTotalScore] = useState(0);

  // Sinkronisasi answers awal
  useEffect(() => {
    if (initialAnswers) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers]);

  // Hitung akumulasi skor dinamis
  useEffect(() => {
    const score = answers.reduce((acc, val) => acc + val, 0);
    setTotalScore(score);
  }, [answers]);

  const handleAnswer = (questionIdx, value) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[questionIdx] = value;
      return updated;
    });
  };

  const allAnswered = answers.every((a) => a > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allAnswered) return;
    if (onSave) {
      onSave(answers, totalScore);
    }
  };

  return (
    <div className="space-y-8">
      {/* Questionnaire Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-base font-bold text-[#0f172a] tracking-tight">{title}</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">{subtitle}</p>
        </div>
        
        {/* Dynamic Cumulative Score Display (Top Right) */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-lg self-start sm:self-auto shadow-none">
          <div className="text-left">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Skor Akumulatif</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-slate-900 leading-none">{totalScore}</span>
              <span className="text-slate-400 text-xs font-semibold">/25</span>
            </div>
          </div>
          
          {/* Comparison indicator if rendering Post-Test and comparison pre-test is available */}
          {comparisonScore !== null && (
            <>
              <div className="w-px h-6 bg-slate-200" />
              <div className="text-right">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Skor Pre-Test</span>
                <span className="text-sm font-bold text-slate-500 block mt-1 leading-none">{comparisonScore}/25</span>
              </div>
              {totalScore > 0 && (
                <>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-left">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Efektivitas</span>
                    <span className={`text-xs font-bold block mt-1 leading-none ${totalScore < comparisonScore ? 'text-emerald-600' : totalScore === comparisonScore ? 'text-slate-500' : 'text-red-500'}`}>
                      {totalScore < comparisonScore ? `↓ ${comparisonScore - totalScore} Poin` : totalScore === comparisonScore ? 'Tetap' : `↑ ${totalScore - comparisonScore} Poin`}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Likert Scale Legend */}
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {LIKERT_LABELS.map((l) => (
          <span key={l.value} className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200/40 rounded px-2 py-1 font-medium">
            {l.value} = {l.label}
          </span>
        ))}
      </div>

      {/* Questions Stack */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {ABQ_QUESTIONS.map((q, idx) => (
            <div
              key={q.id}
              className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 md:p-8 shadow-premium space-y-5 hover-lift transition-all duration-200 relative z-10"
            >
              {/* Question Text */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Pertanyaan {q.id} · {q.indicator}
                </span>
                <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Node Rating Grid selection (Kotak bulat minimalis, Royal Blue #2563eb jika aktif) */}
              <div className="flex gap-3 max-w-sm">
                {LIKERT_LABELS.map((l) => {
                  const isSelected = answers[idx] === l.value;
                  return (
                    <button
                      key={l.value}
                      type="button"
                      id={`abq-q${q.id}-val${l.value}`}
                      onClick={() => handleAnswer(idx, l.value)}
                      title={`${l.value} — ${l.label}`}
                      className={`
                        flex-1 aspect-square rounded-full border text-xs font-bold cursor-pointer
                        transition-all duration-150 flex items-center justify-center
                        ${isSelected
                          ? 'bg-[#2563eb] text-white border-[#2563eb] scale-105 shadow-sm'
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'
                        }
                      `}
                    >
                      {l.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!allAnswered || isSaving}
            className={`
              px-8 py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer hover-lift shadow-md
              transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto
              ${allAnswered && !isSaving
                ? 'bg-gradient-to-r from-[#2563eb] to-[#0ea5e9] hover:from-[#1d4ed8] hover:to-[#0284c7] active:opacity-90 text-white'
                : 'bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed shadow-none !transform-none hover:!shadow-none'
              }
            `}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
          </button>
        </div>
      </form>
    </div>
  );
}
