const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the custom wrappers we added before
const removeWrapper = (chartVar) => {
  const wrapperRegex = new RegExp(`<div style={{ minWidth: \\\`\\\${Math.max\\(100, \\(sortedAthletesForCharts.length / 10\\) \\* 100\\)}%\\\`, height: '100%' }}>\\s*<Bar data=\\{${chartVar}\\}(.*?)/>\\s*</div>`, 'g');
  if (content.match(wrapperRegex)) {
    content = content.replace(wrapperRegex, `<Bar data={${chartVar}}$1/>`);
  }
};
removeWrapper('abqChartData');
removeWrapper('sprintChartData');
removeWrapper('hopChartData');

// 2. Add zoomPlugin import and registration
if (!content.includes("import zoomPlugin from 'chartjs-plugin-zoom';")) {
  content = content.replace("import Calendar from 'react-calendar';", "import Calendar from 'react-calendar';\nimport zoomPlugin from 'chartjs-plugin-zoom';");
  
  if (content.includes("ChartJS.register(")) {
    content = content.replace(
      "ChartJS.register(",
      "ChartJS.register(zoomPlugin, "
    );
  }
}

// 3. Update getChartOptions to include zoom config and fixed min/max
const optionsStart = "  const getChartOptions = (type) => ({";
const optionsNew = `  const getChartOptions = (type) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: { enabled: true, speed: 0.1 },
          pinch: { enabled: true },
          mode: 'x',
        }
      },`;
content = content.replace(optionsStart + '\n    responsive: true,\n    maintainAspectRatio: false,\n    plugins: {', optionsNew);

// 4. Update x-axis scales to max: 9 for initial 10 items view
const scalesRegex = /x: {\n\s*grid: { display: false },\n\s*ticks: { font: { size: 8, weight: '500' }, color: '#64748b' },\n\s*},/;
if (content.match(scalesRegex)) {
  content = content.replace(scalesRegex, `x: {
        min: 0,
        max: 9,
        grid: { display: false },
        ticks: { font: { size: 8, weight: '500' }, color: '#64748b' },
      },`);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Applied plugin zoom fix.');
