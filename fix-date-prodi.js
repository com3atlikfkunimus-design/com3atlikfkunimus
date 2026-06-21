const fs = require('fs');

// --- 1. Fix registrasi page ---
let regPath = 'app/registrasi/page.jsx';
let regCode = fs.readFileSync(regPath, 'utf8');

// Add prodiLainnya state
if (!regCode.includes('prodiLainnya:')) {
  regCode = regCode.replace("prodi: '',", "prodi: '',\n    prodiLainnya: '',");
}

// Add validation for prodiLainnya
if (!regCode.includes("errs.prodiLainnya = 'Tuliskan Program Studi Anda';")) {
  regCode = regCode.replace(
    "if (!form.prodi) errs.prodi = 'Pilih Program Studi';",
    "if (!form.prodi) errs.prodi = 'Pilih Program Studi';\n    if (form.prodi === 'Lainnya' && !form.prodiLainnya.trim()) errs.prodiLainnya = 'Tuliskan Program Studi Anda';"
  );
}

// Save correct prodi
if (!regCode.includes("prodi: form.prodi === 'Lainnya' ? form.prodiLainnya.trim() : form.prodi,")) {
  regCode = regCode.replace(
    "prodi: form.prodi,",
    "prodi: form.prodi === 'Lainnya' ? form.prodiLainnya.trim() : form.prodi,"
  );
}

// Add UI for prodiLainnya
if (!regCode.includes('name="prodiLainnya"')) {
  const uiProdiLainnya = `
            {form.prodi === 'Lainnya' && (
              <div className="space-y-1 mt-3 animate-in slide-in-from-top-2 duration-300">
                <label htmlFor="reg-prodi-lainnya" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tuliskan Program Studi <span className="text-red-400">*</span>
                </label>
                <input
                  id="reg-prodi-lainnya"
                  name="prodiLainnya"
                  type="text"
                  placeholder="Contoh: Kedokteran Gigi"
                  value={form.prodiLainnya}
                  onChange={handleChange}
                  className={inputClass('prodiLainnya')}
                />
                {errors.prodiLainnya && <p className="text-xs text-red-400">{errors.prodiLainnya}</p>}
              </div>
            )}
`;
  regCode = regCode.replace(
    '{errors.prodi && <p className="text-xs text-red-400">{errors.prodi}</p>}\n            </div>',
    '{errors.prodi && <p className="text-xs text-red-400">{errors.prodi}</p>}' + uiProdiLainnya + '\n            </div>'
  );
}

fs.writeFileSync(regPath, regCode, 'utf8');

// --- 2. Fix admin page ---
let adminPath = 'app/admin/page.jsx';
let adminCode = fs.readFileSync(adminPath, 'utf8');

// A. Format Date for Edit Modal
if (!adminCode.includes('formatDateForInput')) {
  const formatDateFunc = `
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
`;
  adminCode = adminCode.replace('const handleEditClick = (athlete) => {', formatDateFunc + '\n  const handleEditClick = (athlete) => {');
  
  adminCode = adminCode.replace(
    "test_date: athlete.test_date || '',",
    "test_date: formatDateForInput(athlete.test_date) || '',"
  );
}

// B. Add states for date filter and edit modal prodiLainnya
if (!adminCode.includes('filterDate')) {
  adminCode = adminCode.replace(
    "const [activeTab, setActiveTab] = useState('semua');",
    "const [activeTab, setActiveTab] = useState('semua');\n  const [filterDate, setFilterDate] = useState('');"
  );
}
if (!adminCode.includes('prodiLainnya:')) {
  adminCode = adminCode.replace(
    "prodi: athlete.prodi || '',",
    "prodi: athlete.prodi || '',\n      prodiLainnya: (athlete.prodi && !DEFAULT_PRODI_OPTIONS.includes(athlete.prodi)) ? athlete.prodi : '',"
  );
  
  // Also when populating editForm, if prodi is not in options, set prodi to 'Lainnya' and prodiLainnya to the actual value
  adminCode = adminCode.replace(
    "prodi: athlete.prodi || '',\n      prodiLainnya: (athlete.prodi && !DEFAULT_PRODI_OPTIONS.includes(athlete.prodi)) ? athlete.prodi : '',",
    "prodi: (athlete.prodi && !DEFAULT_PRODI_OPTIONS.includes(athlete.prodi)) ? 'Lainnya' : (athlete.prodi || ''),\n      prodiLainnya: (athlete.prodi && !DEFAULT_PRODI_OPTIONS.includes(athlete.prodi)) ? athlete.prodi : '',"
  );
}

// C. Update Edit Form submit to use prodiLainnya
if (!adminCode.includes("prodi: editForm.prodi === 'Lainnya'")) {
  adminCode = adminCode.replace(
    "prodi: editForm.prodi,",
    "prodi: editForm.prodi === 'Lainnya' ? editForm.prodiLainnya : editForm.prodi,"
  );
}

// D. Add Date filter UI
if (!adminCode.includes('setFilterDate(e.target.value)')) {
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
  // Insert before the search input
  adminCode = adminCode.replace(
    '<div className="relative w-full sm:w-64">',
    dateFilterUI + '\n                <div className="relative w-full sm:w-64">'
  );
}

// E. Apply Date filter logic
if (!adminCode.includes('if (filterDate)')) {
  adminCode = adminCode.replace(
    "const filteredAthletes = athletes.filter(a => {",
    `const filteredAthletes = athletes.filter(a => {
    if (filterDate) {
      if (!a.test_date) return false;
      const tDate = new Date(a.test_date).toISOString().split('T')[0];
      if (tDate !== filterDate) return false;
    }`
  );
}

// F. Add Prodi dropdown & ProdiLainnya inside Edit Modal
if (!adminCode.includes('value={editForm.prodi}')) {
  const prodiEditUI = `
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600">Program Studi</label>
                  <select
                    value={editForm.prodi}
                    onChange={(e) => setEditForm({ ...editForm, prodi: e.target.value })}
                    className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none"
                  >
                    <option value="">-- Pilih Prodi --</option>
                    {prodiOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {editForm.prodi === 'Lainnya' && (
                  <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                    <label className="text-[9px] font-bold text-slate-600">Tuliskan Program Studi</label>
                    <input 
                      type="text" 
                      value={editForm.prodiLainnya || ''} 
                      onChange={(e) => setEditForm({ ...editForm, prodiLainnya: e.target.value })} 
                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                    />
                  </div>
                )}
`;
  // Insert below Height input
  adminCode = adminCode.replace(
    'onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} \n                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" \n                    />\n                  </div>\n                </div>',
    'onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} \n                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" \n                    />\n                  </div>\n                </div>\n' + prodiEditUI
  );
}

fs.writeFileSync(adminPath, adminCode, 'utf8');
console.log('Script ran successfully');
