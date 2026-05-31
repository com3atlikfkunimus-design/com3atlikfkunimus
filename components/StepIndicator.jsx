'use client';

/**
 * StepIndicator — Progress bar visual untuk alur pendaftaran naracoba.
 *
 * Steps:
 *   1. Informed Consent
 *   2. Registrasi Profil
 *   3. Pre-Test ABQ
 *   4. Sesi 1: Tes Fisik
 *
 * Props:
 *   - currentStep : 1 | 2 | 3 | 4
 */

const STEPS = [
  { id: 1, label: 'Informed Consent', shortLabel: 'Consent' },
  { id: 2, label: 'Registrasi Profil', shortLabel: 'Profil' },
  { id: 3, label: 'Pre-Test ABQ', shortLabel: 'ABQ' },
  { id: 4, label: 'Sesi 1: Tes Fisik', shortLabel: 'Sesi 1' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-2">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center
                    text-sm font-bold border-2 transition-all duration-300
                    ${isCompleted
                      ? 'border-lime-400 text-slate-900'
                      : isActive
                      ? 'border-lime-400 text-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.4)]'
                      : 'border-slate-700 text-slate-600'
                    }
                  `}
                  style={isCompleted ? { background: 'linear-gradient(135deg, #a3e635, #84cc16)' } : {}}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                {/* Label */}
                <span
                  className={`
                    mt-1.5 text-[10px] font-medium text-center leading-tight hidden sm:block
                    ${isActive ? 'text-lime-400' : isCompleted ? 'text-lime-600' : 'text-slate-600'}
                  `}
                  style={{ maxWidth: '64px' }}
                >
                  {step.label}
                </span>
                <span
                  className={`
                    mt-1.5 text-[10px] font-medium text-center leading-tight sm:hidden
                    ${isActive ? 'text-lime-400' : isCompleted ? 'text-lime-600' : 'text-slate-600'}
                  `}
                >
                  {step.shortLabel}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-1 sm:mx-2 h-px mb-5 relative">
                  <div className="absolute inset-0 bg-slate-700 rounded" />
                  <div
                    className="absolute inset-0 rounded transition-all duration-500"
                    style={{
                      background: 'linear-gradient(90deg, #a3e635, #84cc16)',
                      transform: `scaleX(${isCompleted ? 1 : 0})`,
                      transformOrigin: 'left',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
