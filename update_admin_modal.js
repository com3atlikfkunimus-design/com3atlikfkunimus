const fs = require('fs');
const file = 'app/admin/page.jsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Add states for editing
if (!code.includes('const [editingAthlete, setEditingAthlete] = useState(null);')) {
  code = code.replace(
    /const \[toast, setToast\] = useState\(null\);/,
    `const [toast, setToast] = useState(null);\n  const [editingAthlete, setEditingAthlete] = useState(null);\n  const [editForm, setEditForm] = useState({});\n  const [isSavingEdit, setIsSavingEdit] = useState(false);\n  const [selectedProdiFilter, setSelectedProdiFilter] = useState('Semua Prodi');`
  );
}

// 2. Add PRODI_OPTIONS constant if missing
if (!code.includes('const PRODI_OPTIONS = [')) {
  code = code.replace(
    /export default function AdminDashboardPage\(\) \{/,
    `const PRODI_OPTIONS = [
  'Pendidikan Dokter (S1)',
  'Kedokteran Gigi (S1)',
  'Ilmu Keperawatan (S1)',
  'Gizi (S1)',
  'Kesehatan Masyarakat (S1)',
  'Kebidanan (S1)',
  'Teknologi Laboratorium Medis (D4)',
];

export default function AdminDashboardPage() {`
  );
}

// 3. Update filter athletes logic to include Prodi
code = code.replace(
  /const filteredAthletes = athletes\.filter\(\(a\) => \{[\s\S]*?return matchesSearch && matchesTab;\n  \}\);/,
  `const filteredAthletes = athletes.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.researcher.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'normal') {
      matchesTab = a.bmi_category === 'Normal';
    } else if (activeTab === 'risiko') {
      matchesTab = getAnatomicalEvaluation(a).includes('Risiko ketidakstabilan');
    }
    
    let matchesProdi = true;
    if (selectedProdiFilter && selectedProdiFilter !== 'Semua Prodi') {
      matchesProdi = a.prodi === selectedProdiFilter;
    }

    return matchesSearch && matchesTab && matchesProdi;
  });`
);

// 4. Update the Table Headers (add Prodi display conceptually by expanding Umur/BMI header)
code = code.replace(
  /<th className="py-3\.5 px-4 text-center">Umur \/ BMI<\/th>/,
  `<th className="py-3.5 px-4 text-center">Umur / Prodi / BMI</th>`
);

// 5. Update the Table Row to show Prodi
code = code.replace(
  /<td className="py-4 px-4 text-center">\n\s*<div className="font-bold text-slate-800">\{a\.age\} th<\/div>\n\s*<div className="text-\[9px\] text-slate-400 mt-0\.5">\{a\.bmi\} \(\{a\.bmi_category\}\)<\/div>\n\s*<\/td>/g,
  `<td className="py-4 px-4 text-center">
                          <div className="font-bold text-slate-800">{a.age} th</div>
                          <div className="text-[9px] font-semibold text-[#2563eb] mt-0.5">{a.prodi || '-'}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5">{a.bmi} ({a.bmi_category})</div>
                        </td>`
);

// 6. Update Action Buttons to include Edit Button
if (!code.includes('onClick={() => handleEditClick(a)}')) {
  code = code.replace(
    /title="Hapus Data Atlet"\n\s*>\n\s*🗑️ Hapus\n\s*<\/button>/g,
    `title="Hapus Data Atlet"
                            >
                              🗑️ Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditClick(a)}
                              className="
                                px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded border border-amber-100
                                text-[8px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 flex items-center shadow-sm
                              "
                              title="Edit Data Manual"
                            >
                              ✏️ Edit
                            </button>`
  );
}

// 7. Add Prodi Filter Dropdown to UI
if (!code.includes('value={selectedProdiFilter}')) {
  code = code.replace(
    /placeholder="Cari naracoba..."\n\s*className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder:text-slate-400"\n\s*\/>\n\s*<\/div>/,
    `placeholder="Cari naracoba..."
                    className="bg-transparent border-none outline-none text-xs w-full text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                
                <select
                  value={selectedProdiFilter}
                  onChange={(e) => setSelectedProdiFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-[#2563eb]"
                >
                  <option value="Semua Prodi">Semua Prodi</option>
                  {PRODI_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>`
  );
}

// 8. Add handleEditClick & Save logic
if (!code.includes('const handleEditClick = (athlete) => {')) {
  code = code.replace(
    /const handleDeleteAthlete = async \(id\) => \{/,
    `const handleEditClick = (athlete) => {
    setEditingAthlete(athlete);
    setEditForm({
      abq_pre: athlete.abq_pre || 0,
      abq_post: athlete.abq_post || 0,
      sprint_pre: athlete.sprint_pre || 0,
      sprint_post: athlete.sprint_post || 0,
      cmj_pre: athlete.cmj_pre || 0,
      cmj_post: athlete.cmj_post || 0,
      hop_pre: athlete.hop_pre || 0,
      hop_post: athlete.hop_post || 0,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAthlete) return;
    setIsSavingEdit(true);

    try {
      const updates = {
        abq_score: parseInt(editForm.abq_pre, 10) || 0,
        abq_post_score: parseInt(editForm.abq_post, 10) || 0,
        sprint_pre: parseFloat(editForm.sprint_pre) || 0,
        sprint_post: parseFloat(editForm.sprint_post) || 0,
        cmj_pre: parseFloat(editForm.cmj_pre) || 0,
        cmj_post: parseFloat(editForm.cmj_post) || 0,
        hop_pre: parseFloat(editForm.hop_pre) || 0,
        hop_post: parseFloat(editForm.hop_post) || 0,
      };

      const { error } = await supabase
        .from('athletes')
        .update(updates)
        .eq('id', editingAthlete.id);

      if (error) throw error;

      setToast({
        message: 'Data berhasil diperbarui secara manual!',
        type: 'success',
        key: Date.now(),
      });
      
      setEditingAthlete(null);
      fetchSupabaseAthletes(); // Refresh data
    } catch (err) {
      console.error('[Edit] Failed:', err);
      setToast({
        message: 'Gagal memperbarui data. Cek koneksi.',
        type: 'error',
        key: Date.now(),
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteAthlete = async (id) => {`
  );
}

// 9. Inject Edit Modal UI at the very bottom of the component
if (!code.includes('editingAthlete && (')) {
  code = code.replace(
    /<\/ResearchPageLayout>/,
    `
      {/* ── MODAL EDIT MANUAL ── */}
      {editingAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Data Medis</h3>
            <p className="text-xs text-slate-500 mb-6">Ubah skor pre-test & post-test untuk <span className="font-bold">{editingAthlete.name}</span></p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
              {[
                { label: 'ABQ Score', preKey: 'abq_pre', postKey: 'abq_post' },
                { label: 'Sprint (s)', preKey: 'sprint_pre', postKey: 'sprint_post' },
                { label: 'CMJ (cm)', preKey: 'cmj_pre', postKey: 'cmj_post' },
                { label: 'Hop (cm)', preKey: 'hop_pre', postKey: 'hop_post' },
              ].map((field) => (
                <div key={field.label} className="bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{field.label}</span>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-600">Pre-Test</label>
                      <input 
                        type="number" step="any"
                        value={editForm[field.preKey]}
                        onChange={(e) => setEditForm({ ...editForm, [field.preKey]: e.target.value })}
                        className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-bold text-slate-600">Post-Test</label>
                      <input 
                        type="number" step="any"
                        value={editForm[field.postKey]}
                        onChange={(e) => setEditForm({ ...editForm, [field.postKey]: e.target.value })}
                        className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingAthlete(null)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded uppercase tracking-wider transition-colors active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded uppercase tracking-wider transition-colors active:scale-95 flex justify-center items-center gap-2"
              >
                {isSavingEdit ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : '💾 Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </ResearchPageLayout>`
  );
}

fs.writeFileSync(file, code);
console.log('Update finished.');
