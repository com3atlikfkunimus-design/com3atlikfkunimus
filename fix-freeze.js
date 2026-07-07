const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Revert Zoom
content = content.replace("import zoomPlugin from 'chartjs-plugin-zoom';\n", '');
content = content.replace(/import\('chartjs-plugin-zoom'\)\.then\(\(plugin\) => \{\n\s*ChartJS\.register\(plugin\.default \|\| plugin\);\n\s*\}\)\.catch\(console\.error\);/g, '');
const optionsRegex = /zoom: \{\n\s*pan: \{\n\s*enabled: true,\n\s*mode: 'x',\n\s*\},\n\s*zoom: \{\n\s*wheel: \{ enabled: true, speed: 0\.1 \},\n\s*pinch: \{ enabled: true \},\n\s*mode: 'x',\n\s*\}\n\s*\},/g;
content = content.replace(optionsRegex, '');
const scaleXRegex = /x: \{\n\s*min: 0,\n\s*max: 9,/g;
content = content.replace(scaleXRegex, 'x: {\n');

// 2. Add ChartWithScroll component
const componentCode = `
// Wrapper untuk Chart yang bisa di scroll tapi Y Axis diam
const ChartWithScroll = ({ data, options, chartType }) => {
  const ChartComponent = chartType === 'line' ? Line : Bar;
  
  // Opsi khusus Y-Axis yang diam
  const yAxisOptions = {
    ...options,
    maintainAspectRatio: false,
    plugins: { ...options.plugins, legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: options.scales?.y || { display: true }
    }
  };

  // Opsi khusus chart yang bisa digeser (tanpa Y-axis supaya tidak dobel)
  const chartOptions = {
    ...options,
    maintainAspectRatio: false,
    scales: {
      x: options.scales?.x || { display: true },
      y: { ...(options.scales?.y || {}), display: false }
    }
  };

  // Lebar chart proporsional dengan jumlah data (biar bisa digeser)
  const chartWidth = Math.max(100, (data.labels.length / 10) * 100);

  return (
    <div className="relative w-full h-64 flex">
      {/* Y-Axis Frozen Pane */}
      <div className="absolute top-0 left-0 h-full w-[40px] z-10 bg-white pointer-events-none pb-7">
        <ChartComponent data={data} options={yAxisOptions} />
      </div>
      
      {/* Scrollable Chart */}
      <div className="w-full h-full overflow-x-auto overflow-y-hidden pl-[40px]">
        <div style={{ width: \`\${chartWidth}%\`, minWidth: '100%', height: '100%', paddingBottom: '4px' }}>
          <ChartComponent data={data} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
`;

if (!content.includes('ChartWithScroll')) {
  // insert before default export
  content = content.replace('export default function AdminDashboard() {', componentCode + '\nexport default function AdminDashboard() {');
}

// 3. Replace all Bar/Line with ChartWithScroll
const replaceChart = (chartDataVar, typeStr) => {
  const chartRegex = new RegExp(`<Bar data=\\{${chartDataVar}\\}\\s*options=\\{getChartOptions\\((.*?)\\)\\}\\s*\\/>`, 'g');
  content = content.replace(chartRegex, `<ChartWithScroll data={${chartDataVar}} options={getChartOptions($1)} chartType="${typeStr}" />`);
  
  const lineChartRegex = new RegExp(`<Line data=\\{${chartDataVar}\\}\\s*options=\\{getChartOptions\\((.*?)\\)\\}\\s*\\/>`, 'g');
  content = content.replace(lineChartRegex, `<ChartWithScroll data={${chartDataVar}} options={getChartOptions($1)} chartType="${typeStr}" />`);
};

replaceChart('abqChartData', 'bar');
replaceChart('sprintChartData', 'bar');
replaceChart('cmjChartData', 'line');
replaceChart('hopChartData', 'bar');

fs.writeFileSync(file, content, 'utf8');
console.log('Added ChartWithScroll.');
