const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app/admin/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace chart containers with horizontally scrollable wrappers based on athlete count
const replacer = `<div className="h-64 relative w-full overflow-x-auto overflow-y-hidden" style={{ cursor: 'grab' }}>
                  <div style={{ minWidth: \`\${Math.max(filteredAthletes.length * 60, 100)}%\`, height: '100%' }}>`;

content = content.replace(/<div className="h-64 relative">/g, replacer);
content = content.replace(/<Bar data={abqChartData} options={chartOptions} \/>\n\s*<\/div>/g, `<Bar data={abqChartData} options={chartOptions} />\n                  </div>\n                </div>`);
content = content.replace(/<Line data={performanceChartData} options={chartOptions} \/>\n\s*<\/div>/g, `<Line data={performanceChartData} options={chartOptions} />\n                  </div>\n                </div>`);
content = content.replace(/<Bar data={sprintChartData} options={chartOptions} \/>\n\s*<\/div>/g, `<Bar data={sprintChartData} options={chartOptions} />\n                  </div>\n                </div>`);
content = content.replace(/<Bar data={hopChartData} options={chartOptions} \/>\n\s*<\/div>/g, `<Bar data={hopChartData} options={chartOptions} />\n                  </div>\n                </div>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed horizontal scroll for charts.');
