const fs = require('fs');

let file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add isZoomedOut state
if (!content.includes('const [isZoomedOut, setIsZoomedOut]')) {
  content = content.replace(
    'const [activeConfigTab, setActiveConfigTab] = useState(\'sprint\');',
    'const [activeConfigTab, setActiveConfigTab] = useState(\'sprint\');\n  const [isZoomedOut, setIsZoomedOut] = useState(false);'
  );
}

// Replace chartOptions object with getChartOptions function
const startStr = '  const chartOptions = {';
const endStr = '  };\n\n  const getInitials = (fullName) => {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const newChartOptions = `  const getChartOptions = (type) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 9, family: 'Inter, sans-serif', weight: '600' },
          boxWidth: 6,
          usePointStyle: true,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleFont: { size: 10, weight: 'bold' },
        bodyFont: { size: 9 },
        padding: 8,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 8, weight: '500' }, color: '#64748b' },
      },
      y: {
        min: 0,
        max: type === 'sprint' ? 10 : (type === 'cmj' ? 125 : (type === 'abq' ? 30 : 250)),
        grid: { color: '#f8fafc', drawTicks: false },
        ticks: { 
          font: { size: 8, weight: '500' }, 
          color: '#64748b',
          stepSize: type === 'sprint' ? 2 : (type === 'cmj' ? 25 : (type === 'abq' ? 5 : 50)),
          callback: function(val) { return type === 'sprint' ? val + 's' : val; }
        },
        border: { display: false },
      },
    },
  });

  const getInitials = (fullName) => {`;
  
  content = content.slice(0, startIndex) + newChartOptions + content.slice(endIndex + endStr.length);
}

// Update the chart components
content = content.replace('<Bar data={abqChartData} options={chartOptions} />', '<Bar data={abqChartData} options={getChartOptions(\'abq\')} />');
content = content.replace('<Line data={performanceChartData} options={chartOptions} />', '<Line data={performanceChartData} options={getChartOptions(\'cmj\')} />');
content = content.replace('<Bar data={sprintChartData} options={chartOptions} />', '<Bar data={sprintChartData} options={getChartOptions(\'sprint\')} />');
content = content.replace('<Bar data={hopChartData} options={chartOptions} />', '<Bar data={hopChartData} options={getChartOptions(\'hop\')} />');

// Add zoom button
const zoomBtn = `            {/* Side-by-Side Comparative Graphs */}
            <div className="flex justify-end mb-4 relative z-20">
              <button 
                onClick={() => setIsZoomedOut(!isZoomedOut)} 
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
              >
                {isZoomedOut ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    Tampilan Detail (Bisa di-Scroll)
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>
                    Tampilan Presentasi (Zoom Out)
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">`;

if (!content.includes('Tampilan Presentasi (Zoom Out)')) {
  content = content.replace('{/* Side-by-Side Comparative Graphs */}\n            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">', zoomBtn);
}

// Replace minWidth calculation to respect zoom
content = content.split('minWidth: `${Math.max(filteredAthletes.length * 60, 100)}%`').join("minWidth: isZoomedOut ? '100%' : `${Math.max(filteredAthletes.length * 60, 100)}%`");

fs.writeFileSync(file, content, 'utf8');
console.log("Updated charts and zoom function successfully!");
