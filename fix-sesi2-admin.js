const fs = require('fs');

// 1. Fix app/admin/page.jsx (Add missing Sprint and Hop charts)
let adminCode = fs.readFileSync('app/admin/page.jsx', 'utf-8');

const lineChartRender = `<Line data={performanceChartData} options={chartOptions} />
                  </div>
                </div>`;

if (adminCode.includes(lineChartRender) && !adminCode.includes('sprintChartData} options={')) {
  const insertCharts = `
                <div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 shadow-premium relative z-10">
                  <div className="mb-4">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Peningkatan Sprint (Pre vs Post)</h2>
                    <p className="text-[9px] text-slate-400 mt-0.5">Pemetaan pemulihan kecepatan sprint 10/20 m.</p>
                  </div>
                  <div className="h-64 relative">
                    <Bar data={sprintChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 shadow-premium relative z-10">
                  <div className="mb-4">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Peningkatan Single Leg Hop (Pre vs Post)</h2>
                    <p className="text-[9px] text-slate-400 mt-0.5">Pemetaan stabilitas dan fungsional kaki.</p>
                  </div>
                  <div className="h-64 relative">
                    <Bar data={hopChartData} options={chartOptions} />
                  </div>
                </div>
`;
  adminCode = adminCode.replace(lineChartRender, lineChartRender + insertCharts);
  fs.writeFileSync('app/admin/page.jsx', adminCode, 'utf-8');
  console.log("Fixed admin charts.");
} else {
  console.log("Admin charts already inserted or string not found.");
}

// 2. Fix app/sesi-2/page.jsx (Add Camera VideoRecorder logic)
let sesi1Code = fs.readFileSync('app/sesi-1/page.jsx', 'utf-8');
let sesi2Code = fs.readFileSync('app/sesi-2/page.jsx', 'utf-8');

// Copy the missing camera logic from sesi 1 to sesi 2.
// The easiest way is to rewrite Sesi 2 using Sesi 1's code but replacing "Sesi 1" with "Sesi 2" and pointing to saveSesi2Results instead of saveSesi1Results, and handling the routing to post-test.

let newSesi2 = sesi1Code
  .replace(/Sesi1Page/g, 'Sesi2Page')
  .replace(/Sesi 1: Tes Fisik/g, 'Sesi 2: Tes Fisik Pasca-Intervensi')
  .replace(/Sesi 1: Lakukan 3 rangkaian evaluasi motorik atlet berikut secara berurutan./g, 'Sesi 2: Pengujian fisik kedua pasca-intervensi Foot Reflexology.')
  .replace(/Part 1 telah selesai. Lanjutkan ke intervensi pemulihan./g, 'Sesi 2 selesai. Lanjutkan ke kuesioner ABQ tahap akhir.')
  .replace(/handleGoToReflexology/g, 'handleGoToPostTest')
  .replace(/saveSesi1Results/g, 'saveSesi2Results')
  .replace(/'\/reflexology'/g, "'/post-test'")
  .replace(/Mulai Intervensi Foot Reflexology/g, 'Lanjut ke Kuesioner ABQ Pasca-Test');

// We also need to fix testStates initialization in Sesi 2 so that it's empty string for link, hasVideo: false, etc. The copied Sesi 1 code already has this.

fs.writeFileSync('app/sesi-2/page.jsx', newSesi2, 'utf-8');
console.log("Fixed Sesi 2 camera.");

// 3. Fix app/registrasi/page.jsx (Check test_date mapping)
let regCode = fs.readFileSync('app/registrasi/page.jsx', 'utf-8');
if (regCode.includes('setProfile({ ...profile, test_date: e.target.value })')) {
   console.log("Registrasi test_date is fine.");
} else {
   console.log("Registrasi test_date might have an issue, need manual check.");
}
