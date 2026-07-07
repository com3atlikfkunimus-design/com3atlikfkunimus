const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Ultra safe ChartWithScroll
const safeComponentCode = `
// Wrapper untuk Chart yang bisa di scroll tapi Y Axis diam
const ChartWithScroll = ({ data, options, chartType }) => {
  const ChartComponent = chartType === 'line' ? Line : Bar;
  
  const yAxisOptions = {
    ...options,
    maintainAspectRatio: false,
    plugins: { ...(options?.plugins || {}), legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: options?.scales?.y || { display: true }
    }
  };

  const chartOptions = {
    ...options,
    maintainAspectRatio: false,
    scales: {
      x: options?.scales?.x || { display: true },
      y: { ...(options?.scales?.y || {}), display: false }
    }
  };

  const len = data && data.labels ? data.labels.length : 10;
  const chartWidth = Math.max(100, (len / 10) * 100);

  return (
    <div className="relative w-full h-64 flex">
      <div className="absolute top-0 left-0 h-full w-[40px] z-10 bg-white pointer-events-none pb-7">
        {data && <ChartComponent data={data} options={yAxisOptions} />}
      </div>
      <div className="w-full h-full overflow-x-auto overflow-y-hidden pl-[40px]">
        <div style={{ width: \`\${chartWidth}%\`, minWidth: '100%', height: '100%', paddingBottom: '4px' }}>
          {data && <ChartComponent data={data} options={chartOptions} />}
        </div>
      </div>
    </div>
  );
};
`;

// Replace the old ChartWithScroll with the safe one
const oldComponentStart = '// Wrapper untuk Chart yang bisa di scroll tapi Y Axis diam';
const oldComponentEnd = '  );\n};\n';

const startIndex = content.indexOf(oldComponentStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(oldComponentEnd, startIndex) + oldComponentEnd.length;
  content = content.slice(0, startIndex) + safeComponentCode + content.slice(endIndex);
}

// 2. Fix the CMJ Line Chart missing replacement!
const cmjRegex = /<Line data=\{performanceChartData\}\s*options=\{getChartOptions\((.*?)\)\}\s*\/>/g;
content = content.replace(cmjRegex, '<ChartWithScroll data={performanceChartData} options={getChartOptions($1)} chartType="line" />');

fs.writeFileSync(file, content, 'utf8');
console.log('Applied safe ChartWithScroll and fixed CMJ chart replacement.');
