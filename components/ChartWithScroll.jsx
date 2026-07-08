import React, { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';

// Wrapper untuk Chart yang bisa di scroll tapi Y Axis diam
const ChartWithScroll = ({ data, options, chartType }) => {
  const ChartComponent = chartType === 'line' ? Line : Bar;
  
  // Create an empty dataset to render ONLY the Y-Axis in the frozen pane
  const emptyData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.labels || [],
      datasets: data.datasets ? data.datasets.map(ds => ({ ...ds, data: [] })) : []
    };
  }, [data]);

  const yAxisOptions = {
    ...options,
    maintainAspectRatio: false,
    plugins: { 
      ...(options?.plugins || {}), 
      legend: { display: false }, 
      tooltip: { enabled: false } 
    },
    scales: {
      x: { display: false },
      y: options?.scales?.y || { display: true }
    }
  };

  const chartOptions = {
    ...options,
    maintainAspectRatio: false,
    layout: {
      padding: { left: 10, right: 20 }
    },
    scales: {
      x: options?.scales?.x || { display: true },
      y: { ...(options?.scales?.y || {}), display: false }
    }
  };

  const len = data && data.labels ? data.labels.length : 10;
  const chartWidth = Math.max(100, (len / 10) * 100);

  return (
    <div className="relative w-full h-64 flex bg-white">
      {/* Y-Axis Frozen Pane */}
      <div className="absolute top-0 left-0 h-full w-[40px] z-10 bg-white pointer-events-none pb-[28px] border-r border-slate-300">
        {emptyData && <ChartComponent data={emptyData} options={yAxisOptions} />}
      </div>
      
      {/* Scrollable Chart */}
      <div className="w-full h-full overflow-x-auto overflow-y-hidden pl-[40px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pb-2">
        <div style={{ width: `${chartWidth}%`, minWidth: '100%', height: '100%' }}>
          {data && <ChartComponent data={data} options={chartOptions} />}
        </div>
      </div>
    </div>
  );
};

export default ChartWithScroll;
