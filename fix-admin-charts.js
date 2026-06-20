const fs = require('fs');

let adminCode = fs.readFileSync('app/admin/page.jsx', 'utf-8');

const targetStr = `<Line data={performanceChartData} options={chartOptions} />
                </div>
              </div>`;

if (adminCode.includes(targetStr) && !adminCode.includes('sprintChartData} options={')) {
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
  adminCode = adminCode.replace(targetStr, targetStr + insertCharts);
  
  // also make grid-cols-2 to grid-cols-2 or grid-cols-4? let's make the container have 2 columns and all charts will wrap if needed
  
  fs.writeFileSync('app/admin/page.jsx', adminCode, 'utf-8');
  console.log("Fixed admin charts.");
} else {
  console.log("String still not found.");
}
