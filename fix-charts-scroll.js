const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Create chartAthletes right after chart configs comment
if (!content.includes('const chartAthletes = [...filteredAthletes].reverse();')) {
  content = content.replace('// Chart configs\n  const chartLabels = filteredAthletes.map((a) => a.name.split(\' \')[0]);', 
                            '// Chart configs\n  const chartAthletes = [...filteredAthletes].reverse();\n  const chartLabels = chartAthletes.map((a) => a.name.split(\' \')[0]);');
}

// 2. Replace filteredAthletes with chartAthletes in datasets
const datasetsRegex = /(?:abqChartData|performanceChartData|sprintChartData|hopChartData)[\s\S]*?(?=};\n)/g;
let newContent = content;
let match;
while ((match = datasetsRegex.exec(content)) !== null) {
  let block = match[0];
  let replacedBlock = block.replace(/filteredAthletes/g, 'chartAthletes');
  newContent = newContent.replace(block, replacedBlock);
}

// 3. Wrap charts in scrollable divs
const charts = ['abqChartData', 'performanceChartData', 'sprintChartData', 'hopChartData'];
const components = ['Bar', 'Line', 'Bar', 'Bar'];

charts.forEach((chart, idx) => {
  const comp = components[idx];
  
  // Use regex to match the wrapper div and the chart component
  const regex = new RegExp(`<div className="h-64 sm:h-80 w-full"[^>]*>\\s*<${comp} data=\\{${chart}\\}[^>]*/>\\s*</div>`, 'g');
  
  newContent = newContent.replace(regex, (fullMatch) => {
    // Extract the chart component tag
    const chartTagMatch = fullMatch.match(new RegExp(`<${comp} data=\\{${chart}\\}[^>]*/>`));
    const chartTag = chartTagMatch ? chartTagMatch[0] : '';
    
    return `<div className="h-64 sm:h-80 w-full overflow-x-auto custom-scrollbar">
                  <div style={{ minWidth: \`\${Math.max(100, chartAthletes.length * 70)}px\`, height: '100%' }}>
                    ${chartTag}
                  </div>
                </div>`;
  });
});

fs.writeFileSync(file, newContent, 'utf8');
console.log('Successfully updated charts for scrolling and reversed data.');
