const fs = require('fs');

let adminCode = fs.readFileSync('app/admin/page.jsx', 'utf-8');

// 1. Add states for editing researcher
const statesToAdd = `
  const [editingResearcher, setEditingResearcher] = useState(null);
  const [editResearcherForm, setEditResearcherForm] = useState({ name: '', username: '', password: '' });
  const [isSavingResearcherEdit, setIsSavingResearcherEdit] = useState(false);
`;

if (!adminCode.includes('editingResearcher')) {
  adminCode = adminCode.replace('const [editingAthlete, setEditingAthlete] = useState(null);', statesToAdd + '\n  const [editingAthlete, setEditingAthlete] = useState(null);');
}

// 2. Add handlers
const handlersToAdd = `
  const handleEditResearcherClick = (res) => {
    setEditingResearcher(res);
    setEditResearcherForm({
      name: res.name || '',
      username: res.username || '',
      password: res.password || ''
    });
  };

  const handleSaveResearcherEdit = async () => {
    if (!editingResearcher) return;
    if (!window.confirm('Apakah Anda yakin ingin menyimpan perubahan data peneliti ini?')) return;
    setIsSavingResearcherEdit(true);

    try {
      const isLocal = editingResearcher.id && editingResearcher.id.toString().startsWith('local-');
      
      if (!isLocal) {
        const { error } = await supabase
          .from('researchers')
          .update({
            name: editResearcherForm.name,
            username: editResearcherForm.username,
            password: editResearcherForm.password
          })
          .eq('id', editingResearcher.id);

        if (error) throw error;
      } else {
        // Update local researchers array
        const stored = localStorage.getItem('com7_local_researchers') || '[]';
        const parsed = JSON.parse(stored);
        const updatedLocal = parsed.map(r => 
          r.id === editingResearcher.id 
          ? { ...r, name: editResearcherForm.name, username: editResearcherForm.username, password: editResearcherForm.password }
          : r
        );
        localStorage.setItem('com7_local_researchers', JSON.stringify(updatedLocal));
      }

      setToast({ message: 'Data peneliti berhasil diperbarui!', type: 'success', key: Date.now() });
      setEditingResearcher(null);
      fetchResearchers(); // Refresh
    } catch (err) {
      console.error('[Edit Researcher] Failed:', err);
      setToast({ message: 'Gagal memperbarui data peneliti.', type: 'error', key: Date.now() });
    } finally {
      setIsSavingResearcherEdit(false);
    }
  };

  const handleDeleteResearcher = async (res) => {
    if (!window.confirm('PERINGATAN!\\nApakah Anda yakin ingin menghapus akun peneliti ini?')) return;

    try {
      const isLocal = res.id && res.id.toString().startsWith('local-');
      if (!isLocal) {
        const { error } = await supabase.from('researchers').delete().eq('id', res.id);
        if (error) throw error;
      } else {
        const stored = localStorage.getItem('com7_local_researchers') || '[]';
        const parsed = JSON.parse(stored);
        const updatedLocal = parsed.filter(r => r.id !== res.id);
        localStorage.setItem('com7_local_researchers', JSON.stringify(updatedLocal));
      }

      setToast({ message: 'Akun peneliti berhasil dihapus.', type: 'success', key: Date.now() });
      fetchResearchers(); // Refresh
    } catch (err) {
      console.error('[Delete Researcher] Failed:', err);
      setToast({ message: 'Gagal menghapus peneliti.', type: 'error', key: Date.now() });
    }
  };
`;

if (!adminCode.includes('handleEditResearcherClick')) {
  adminCode = adminCode.replace('const handleEditClick = (athlete) => {', handlersToAdd + '\n  const handleEditClick = (athlete) => {');
}

// 3. Inject Edit Modal UI at the bottom along with other modals
const editModalUI = `
      {/* ── MODAL EDIT RESEARCHER ── */}
      {editingResearcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-1">Edit Akun Peneliti</h3>
            <p className="text-xs text-slate-500 mb-6">Ubah data untuk <span className="font-bold">{editingResearcher.name}</span></p>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600">Nama Lengkap Peneliti</label>
                  <input 
                    type="text" 
                    value={editResearcherForm.name} 
                    onChange={(e) => setEditResearcherForm({ ...editResearcherForm, name: e.target.value })} 
                    className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600">Username</label>
                  <input 
                    type="text" 
                    value={editResearcherForm.username} 
                    onChange={(e) => setEditResearcherForm({ ...editResearcherForm, username: e.target.value })} 
                    className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-600">Password</label>
                  <input 
                    type="text" 
                    value={editResearcherForm.password} 
                    onChange={(e) => setEditResearcherForm({ ...editResearcherForm, password: e.target.value })} 
                    className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" 
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setEditingResearcher(null)}
                className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded uppercase tracking-wider transition-colors active:scale-95 border border-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveResearcherEdit}
                disabled={isSavingResearcherEdit}
                className="flex-1 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs rounded uppercase tracking-wider transition-colors active:scale-95 flex justify-center items-center gap-2"
              >
                {isSavingResearcherEdit ? (
                  <><span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span> Menyimpan...</>
                ) : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!adminCode.includes('MODAL EDIT RESEARCHER')) {
  adminCode = adminCode.replace('{/* ── MODAL EDIT MANUAL ── */}', editModalUI + '\n      {/* ── MODAL EDIT MANUAL ── */}');
}

// 4. Update rendering of Researcher cards to add Edit and Delete buttons
const oldCardRegex = /<div key=\{res\.id \|\| res\.username\} className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

const newCard = `<div key={res.id || res.username} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-extrabold shadow-sm shrink-0">
                          {getInitials(res.name)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs text-slate-800 truncate leading-none">{res.name}</p>
                          <p className="text-[9px] text-[#2563eb] font-semibold mt-1">@{res.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditResearcherClick(res)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors" title="Edit Peneliti">✏️</button>
                        <button onClick={() => handleDeleteResearcher(res)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors" title="Hapus Peneliti">🗑️</button>
                      </div>
                    </div>`;

adminCode = adminCode.replace(oldCardRegex, newCard);

fs.writeFileSync('app/admin/page.jsx', adminCode, 'utf-8');
console.log('Fixed CRUD Researchers');
