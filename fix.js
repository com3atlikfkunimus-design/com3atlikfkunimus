const fs = require('fs');
let content = fs.readFileSync('app/admin/page.jsx', 'utf8');

content = content.replaceAll(
  '<div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 shadow-premium relative z-10">',
  '<div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 shadow-premium relative z-10 flex flex-col h-full">'
);

content = content.replaceAll(
  '<div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 shadow-premium relative z-10 flex flex-col h-full flex flex-col h-full">',
  '<div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-6 shadow-premium relative z-10 flex flex-col h-full">'
);

content = content.replaceAll(
  '<div className="h-64 relative w-full">',
  '<div className="flex-1 relative w-full min-h-[300px]">'
);

fs.writeFileSync('app/admin/page.jsx', content);
console.log('Fixed glass-panel layouts');
