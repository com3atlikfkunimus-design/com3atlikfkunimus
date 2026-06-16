const fs = require('fs');

let adminFile = 'app/admin/page.jsx';
let adminCode = fs.readFileSync(adminFile, 'utf8');

// 1. Convert PRODI_OPTIONS to state
if (!adminCode.includes('const [prodiOptions, setProdiOptions] = useState(')) {
  adminCode = adminCode.replace(
    /const PRODI_OPTIONS = \[[\s\S]*?\];/,
    `const DEFAULT_PRODI_OPTIONS = [
  'Pendidikan Dokter (S1)',
  'Profesi Dokter',
  'Ilmu Keperawatan (S1)',
  'Profesi Ners',
  'Kebidanan (S1)',
  'Profesi Bidan',
  'Kesehatan Masyarakat (S1)',
  'Gizi (S1)',
  'Farmasi (S1)',
  'Fisioterapi (S1)',
  'Teknologi Laboratorium Medis (D4)',
  'Lainnya',
];`
  );

  adminCode = adminCode.replace(
    /export default function AdminDashboardPage\(\) \{/,
    `export default function AdminDashboardPage() {
  const [prodiOptions, setProdiOptions] = useState(DEFAULT_PRODI_OPTIONS);
  const [newProdiInput, setNewProdiInput] = useState('');`
  );

  adminCode = adminCode.replace(
    /const savedConfigs = localStorage\.getItem\('com7_test_configurations'\);/,
    `const savedConfigs = localStorage.getItem('com7_test_configurations');
      const savedProdi = localStorage.getItem('com7_prodi_options');
      if (savedProdi) setProdiOptions(JSON.parse(savedProdi));`
  );

  adminCode = adminCode.replace(
    /\{PRODI_OPTIONS\.map/g,
    `{prodiOptions.map`
  );
}

// 2. Add calculateBMI function outside component if not exists
if (!adminCode.includes('function calculateBMI(weight, height)')) {
  adminCode = adminCode.replace(
    /export default function AdminDashboardPage\(\) \{/,
    `function calculateBMI(weight, height) {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || w <= 0 || h <= 0) return null;

  const heightM = h / 100;
  const bmi = w / (heightM * heightM);
  const bmiRounded = parseFloat(bmi.toFixed(1));

  let category = 'Normal';
  if (bmiRounded < 18.5) {
    category = 'Underweight';
  } else if (bmiRounded >= 25 && bmiRounded < 30) {
    category = 'Overweight';
  } else if (bmiRounded >= 30) {
    category = 'Obesitas';
  }

  return { bmi: bmiRounded, category };
}

export default function AdminDashboardPage() {`
  );
}

// 3. Update handleEditClick to include biographic data
if (!adminCode.includes('name: athlete.name ||')) {
  adminCode = adminCode.replace(
    /setEditForm\(\{/,
    `setEditForm({
      name: athlete.name || '',
      age: athlete.age || '',
      weight: athlete.weight || '',
      height: athlete.height || '',
      prodi: athlete.prodi || '',`
  );
}

// 4. Update handleSaveEdit to calculate BMI and include bio updates
if (!adminCode.includes('const bmiData = calculateBMI(')) {
  adminCode = adminCode.replace(
    /const updates = \{[\s\S]*?hop_post: parseFloat\(editForm\.hop_post\) \|\| 0,\n\s*\};/,
    `const bmiData = calculateBMI(editForm.weight, editForm.height);
      const updates = {
        name: editForm.name,
        age: parseInt(editForm.age, 10) || 0,
        weight: parseFloat(editForm.weight) || 0,
        height: parseFloat(editForm.height) || 0,
        prodi: editForm.prodi,
        bmi: bmiData ? bmiData.bmi : 0,
        bmi_category: bmiData ? bmiData.category : 'Unknown',
        abq_score: parseInt(editForm.abq_pre, 10) || 0,
        abq_post_score: parseInt(editForm.abq_post, 10) || 0,
        sprint_pre: parseFloat(editForm.sprint_pre) || 0,
        sprint_post: parseFloat(editForm.sprint_post) || 0,
        cmj_pre: parseFloat(editForm.cmj_pre) || 0,
        cmj_post: parseFloat(editForm.cmj_post) || 0,
        hop_pre: parseFloat(editForm.hop_pre) || 0,
        hop_post: parseFloat(editForm.hop_post) || 0,
      };`
  );
}

// 5. Add window.confirm to handleSaveEdit
if (!adminCode.includes("window.confirm('Apakah Anda yakin ingin menyimpan")) {
  adminCode = adminCode.replace(
    /const handleSaveEdit = async \(\) => \{\n\s*if \(\!editingAthlete\) return;\n\s*setIsSavingEdit\(true\);/,
    `const handleSaveEdit = async () => {
    if (!editingAthlete) return;
    if (!window.confirm('Apakah Anda yakin ingin menyimpan perubahan data ini?')) return;
    setIsSavingEdit(true);`
  );
}

// 6. Add window.confirm to handleDeleteAthlete
if (!adminCode.includes("window.confirm('Apakah Anda benar-benar yakin ingin MENGHAPUS")) {
  adminCode = adminCode.replace(
    /const handleDeleteAthlete = async \(id\) => \{/,
    `const handleDeleteAthlete = async (id) => {
    if (!window.confirm('Apakah Anda benar-benar yakin ingin MENGHAPUS data atlet ini? Tindakan ini tidak dapat dibatalkan.')) return;`
  );
}

// 7. Inject UI fields for biographic data into Edit Modal
if (!adminCode.includes('label className="text-[9px] font-bold text-slate-600">Nama')) {
  adminCode = adminCode.replace(
    /<h3 className="text-lg font-bold text-slate-800 mb-1">Edit Data Medis<\/h3>\n\s*<p className="text-xs text-slate-500 mb-6">Ubah skor pre-test & post-test untuk <span className="font-bold">\{editingAthlete\.name\}<\/span><\/p>\n\s*<div className="space-y-4 max-h-\[60vh\] overflow-y-auto pr-2 pb-2">/,
    `<h3 className="text-lg font-bold text-slate-800 mb-1">Edit Data Atlet</h3>
            <p className="text-xs text-slate-500 mb-6">Ubah biografi dan rekam medis untuk <span className="font-bold">{editingAthlete.name}</span></p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
              <div className="bg-slate-50 p-3 rounded border border-slate-100 space-y-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Data Biografi</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                    className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-600">Umur (th)</label>
                    <input 
                      type="number" 
                      value={editForm.age} 
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })} 
                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-600">Berat (kg)</label>
                    <input 
                      type="number" step="any"
                      value={editForm.weight} 
                      onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })} 
                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[9px] font-bold text-slate-600">Tinggi (cm)</label>
                    <input 
                      type="number" step="any"
                      value={editForm.height} 
                      onChange={(e) => setEditForm({ ...editForm, height: e.target.value })} 
                      className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600">Program Studi</label>
                  <select 
                    value={editForm.prodi} 
                    onChange={(e) => setEditForm({ ...editForm, prodi: e.target.value })} 
                    className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none cursor-pointer"
                  >
                    {prodiOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>`
  );
}

// 8. Add Config UI for Prodi in currentMenu === 'config'
if (!adminCode.includes('Konfigurasi Program Studi')) {
  adminCode = adminCode.replace(
    /\{currentMenu === 'config' && \(\n\s*<div className="animate-in fade-in slide-in-from-bottom-2 duration-300">/,
    `{currentMenu === 'config' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Prodi Settings Box */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
                    <span className="text-lg">🎓</span> Konfigurasi Program Studi
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">Kelola daftar pilihan Program Studi yang muncul di halaman Registrasi.</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {prodiOptions.map((prodi, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full text-xs text-slate-700 font-medium">
                        {prodi}
                        <button 
                          type="button" 
                          onClick={() => {
                            if(window.confirm(\`Hapus prodi "\${prodi}"?\`)){
                              const newOpts = prodiOptions.filter(p => p !== prodi);
                              setProdiOptions(newOpts);
                              localStorage.setItem('com7_prodi_options', JSON.stringify(newOpts));
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 ml-1 bg-white hover:bg-rose-50 w-4 h-4 rounded-full flex items-center justify-center font-bold pb-0.5 transition-colors"
                          title="Hapus Prodi"
                        >&times;</button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 max-w-sm">
                    <input 
                      type="text" 
                      placeholder="Masukkan nama Prodi baru..." 
                      value={newProdiInput}
                      onChange={(e) => setNewProdiInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newProdiInput.trim() !== '') {
                          if (!prodiOptions.includes(newProdiInput.trim())) {
                            const newOpts = [...prodiOptions, newProdiInput.trim()];
                            setProdiOptions(newOpts);
                            localStorage.setItem('com7_prodi_options', JSON.stringify(newOpts));
                            setNewProdiInput('');
                            setToast({ message: 'Prodi ditambahkan!', type: 'success', key: Date.now() });
                          }
                        }
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg outline-none focus:border-[#2563eb]"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newProdiInput.trim() !== '' && !prodiOptions.includes(newProdiInput.trim())) {
                          const newOpts = [...prodiOptions, newProdiInput.trim()];
                          setProdiOptions(newOpts);
                          localStorage.setItem('com7_prodi_options', JSON.stringify(newOpts));
                          setNewProdiInput('');
                          setToast({ message: 'Prodi ditambahkan!', type: 'success', key: Date.now() });
                        }
                      }}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                    >Tambah</button>
                  </div>
                </div>`
  );
}

fs.writeFileSync(adminFile, adminCode);
console.log('Admin page updated successfully.');
