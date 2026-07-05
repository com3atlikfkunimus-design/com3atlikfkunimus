const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHopChart = `  const hopChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Hop Pre (cm)',
        data: filteredAthletes.map((a) => ((a.hop_pre_kanan || a.hop_pre || 0) + (a.hop_pre_kiri || a.hop_pre || 0))/2),
        backgroundColor: 'rgba(139, 92, 246, 0.95)',
        borderRadius: 5,
        barPercentage: 0.55,
      },
      {
        label: 'Hop Post (cm)',
        data: filteredAthletes.map((a) => ((a.hop_post_kanan || a.hop_post || 0) + (a.hop_post_kiri || a.hop_post || 0))/2),
        backgroundColor: 'rgba(217, 70, 239, 0.95)',
        borderRadius: 5,
        barPercentage: 0.55,
      },
    ],
  };`;

const newHopChart = `  const hopChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Hop Pre Kanan (cm)',
        data: filteredAthletes.map((a) => a.hop_pre_kanan || a.hop_pre || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.95)',
        borderRadius: 5,
        barPercentage: 0.55,
      },
      {
        label: 'Hop Pre Kiri (cm)',
        data: filteredAthletes.map((a) => a.hop_pre_kiri || a.hop_pre || 0),
        backgroundColor: 'rgba(167, 139, 250, 0.95)',
        borderRadius: 5,
        barPercentage: 0.55,
      },
      {
        label: 'Hop Post Kanan (cm)',
        data: filteredAthletes.map((a) => a.hop_post_kanan || a.hop_post || 0),
        backgroundColor: 'rgba(217, 70, 239, 0.95)',
        borderRadius: 5,
        barPercentage: 0.55,
      },
      {
        label: 'Hop Post Kiri (cm)',
        data: filteredAthletes.map((a) => a.hop_post_kiri || a.hop_post || 0),
        backgroundColor: 'rgba(232, 121, 249, 0.95)',
        borderRadius: 5,
        barPercentage: 0.55,
      },
    ],
  };`;

if (content.includes(oldHopChart)) {
  content = content.replace(oldHopChart, newHopChart);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated Single Leg Hop chart to separate left and right legs.');
} else {
  console.log('Could not find the old hop chart data structure.');
}
