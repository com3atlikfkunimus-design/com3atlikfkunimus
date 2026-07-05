const fs = require('fs');
const files = ['app/admin/page.jsx', 'app/sesi-1/page.jsx', 'app/sesi-2/page.jsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/5D1gE7L2KGs(\?rel=0)?/g, 'fyzJXYNJkh4?rel=0');
  fs.writeFileSync(file, content, 'utf8');
});

console.log("Updated YouTube URLs in test pages");
