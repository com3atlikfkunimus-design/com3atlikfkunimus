const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const chartDataStart = 'const abqChartData = {';
const newSortCode = `  const sortedAthletesForCharts = [...filteredAthletes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));\n\n  ` + chartDataStart;

if (content.includes(chartDataStart) && !content.includes('sortedAthletesForCharts')) {
  content = content.replace(chartDataStart, newSortCode);
  content = content.replace(/labels: filteredAthletes.map/g, 'labels: sortedAthletesForCharts.map');
  content = content.replace(/data: filteredAthletes.map/g, 'data: sortedAthletesForCharts.map');
}

const wrapChart = (chartVar) => {
  const target = `<Bar data={${chartVar}} options={getChartOptions(`;
  const replacement = `<div style={{ minWidth: \`\${Math.max(100, (sortedAthletesForCharts.length / 10) * 100)}%\`, height: '100%' }}>\n                          <Bar data={${chartVar}} options={getChartOptions(`;
  content = content.replace(target, replacement);
  
  const closeTargetRegex = new RegExp(`(<Bar data=\\{${chartVar}\\}.*?\\/>)`);
  content = content.replace(closeTargetRegex, '$1\n                        </div>');
};

wrapChart('abqChartData');
wrapChart('sprintChartData');
wrapChart('hopChartData');

fs.writeFileSync(file, content, 'utf8');
console.log('Applied chart width and sorting.');
