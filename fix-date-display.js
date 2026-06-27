const fs = require('fs');

let file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add formatDateForDisplay function
if (!content.includes('const formatDateForDisplay =')) {
  const displayFunc = `  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString).replace("T", " ").substring(0, 16);
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      
      return \`\${day}/\${month}/\${year} \${hours}:\${minutes}\`;
    } catch(e) {
      return dateString;
    }
  };

  const formatDateForInput =`;
  
  content = content.replace('  const formatDateForInput =', displayFunc);
}

// Replace rendering of test_date
content = content.replace(
  '<td className="py-4 px-4 text-slate-500 font-semibold">{a.test_date ? a.test_date.replace("T", " ") : \'-\'}</td>',
  '<td className="py-4 px-4 text-slate-500 font-semibold">{formatDateForDisplay(a.test_date)}</td>'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed test_date display format in admin page.");
