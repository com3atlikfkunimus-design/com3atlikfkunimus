const fs = require('fs');

let adminPath = 'app/admin/page.jsx';
let adminCode = fs.readFileSync(adminPath, 'utf8');

// 1. Fix filterDate UI
if (!adminCode.includes('type="date"')) {
  const dateFilterUI = `
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">Tanggal:</span>
                  <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="bg-white border border-slate-200 text-xs text-slate-600 rounded-full px-3 py-1.5 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                  {filterDate && (
                    <button onClick={() => setFilterDate('')} className="text-[10px] text-rose-500 hover:bg-rose-50 px-2 py-1 rounded-full font-bold transition-colors">
                      Reset
                    </button>
                  )}
                </div>
`;
  // Let's insert it right after the flex container of the search bar
  // Currently the structure is:
  // <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
  //   <div className="flex items-center gap-2"> ...tabs... </div>
  //   <div className="relative"> <input placeholder="Cari naracoba..." /> ... </div>
  // </div>
  adminCode = adminCode.replace(
    '<div className="relative">\n                  <input\n                    type="text"\n                    placeholder="Cari naracoba..."',
    dateFilterUI + '\n                <div className="relative">\n                  <input\n                    type="text"\n                    placeholder="Cari naracoba..."'
  );
}

// 2. Fix handleSaveEdit test_date ISO string
if (!adminCode.includes('test_date: new Date(editForm.test_date).toISOString(),')) {
  adminCode = adminCode.replace(
    'test_date: editForm.test_date,',
    'test_date: editForm.test_date ? new Date(editForm.test_date).toISOString() : new Date().toISOString(),'
  );
}

fs.writeFileSync(adminPath, adminCode, 'utf8');
console.log('Script ran successfully');
