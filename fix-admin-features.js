const fs = require('fs');

// 1. Fix app/registrasi/page.jsx (change date to datetime-local)
let regCode = fs.readFileSync('app/registrasi/page.jsx', 'utf-8');
// replace `type="date"` for test_date with `type="datetime-local"`
regCode = regCode.replace('type="date"\n                  value={profile.test_date || \'\'}', 'type="datetime-local"\n                  value={profile.test_date || \'\'}');
regCode = regCode.replace('type="date" //', 'type="datetime-local" //');
// There might be multiple or just one. Let's do a more robust replace:
regCode = regCode.replace(/type="date"([\s\S]*?value=\{profile.test_date)/g, 'type="datetime-local"$1');
fs.writeFileSync('app/registrasi/page.jsx', regCode, 'utf-8');
console.log('Fixed registrasi date input');

// 2. Fix app/admin/page.jsx
let adminCode = fs.readFileSync('app/admin/page.jsx', 'utf-8');

// A. Fix YouTube embed parsing in handleSaveConfigs
const ytFix = `
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/').split('&')[0];
    }
    return url;
  };
`;

if (!adminCode.includes('getEmbedUrl')) {
  adminCode = adminCode.replace('const handleSaveConfigs = (e) => {', ytFix + '\n  const handleSaveConfigs = (e) => {\n    // Fix YouTube URLs before saving\n    const fixedTests = { ...testDetails };\n    Object.keys(fixedTests).forEach(k => { if(fixedTests[k].videoUrl) fixedTests[k].videoUrl = getEmbedUrl(fixedTests[k].videoUrl); });\n    setTestDetails(fixedTests);\n');
}

// B. Format the test_date in table to show time nicely
// Currently: <td className="py-4 px-4 text-slate-500 font-semibold">{a.test_date || '-'}</td>
adminCode = adminCode.replace(
  '<td className="py-4 px-4 text-slate-500 font-semibold">{a.test_date || \'-\'}</td>',
  '<td className="py-4 px-4 text-slate-500 font-semibold">{a.test_date ? a.test_date.replace("T", " ") : \'-\'}</td>'
);

// C. Add Import Data Button and Template Download logic
// We'll place the button next to "Ekspor Database Excel"
const exportBtnRegex = /<button\s+onClick=\{exportToExcel\}[\s\S]*?Ekspor Database Excel\s*<\/button>/;

const importUI = `
                  <div className="flex gap-2">
                    <label className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95 flex justify-center items-center gap-2 cursor-pointer border border-emerald-200">
                      📥 Import CSV
                      <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                    </label>
                    <button onClick={downloadTemplate} className="px-3 py-2 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-95 border border-slate-200" title="Download Template CSV">
                      📄 Template
                    </button>
                  </div>
`;

if (adminCode.match(exportBtnRegex)) {
   adminCode = adminCode.replace(exportBtnRegex, '$&\n' + importUI);
}

// D. Add handleImportCSV and downloadTemplate functions inside AdminPage component
const importLogic = `
  const downloadTemplate = () => {
    const template = "name,age,weight,height,prodi,test_date,abq_pre,abq_post,sprint_pre,sprint_post,cmj_pre,cmj_post,hop_kanan_pre,hop_kiri_pre,hop_kanan_post,hop_kiri_post\\nBudi,20,65,170,Teknik,2026-06-21T08:00,10,5,5.1,4.9,35,40,120,120,130,130";
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "template_import_atlet.csv";
    link.click();
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\\n');
      const headers = lines[0].split(',');
      
      const newAthletes = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentline = lines[i].split(',');
        const athlete = {};
        for (let j = 0; j < headers.length; j++) {
          athlete[headers[j].trim()] = currentline[j] ? currentline[j].trim() : '';
        }
        
        // Calculate BMI
        const weight = parseFloat(athlete.weight) || 0;
        const heightM = (parseFloat(athlete.height) || 0) / 100;
        let bmi = 0;
        let bmiCat = 'Unknown';
        if (weight > 0 && heightM > 0) {
          bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
          if (bmi < 18.5) bmiCat = 'Underweight';
          else if (bmi >= 18.5 && bmi < 25) bmiCat = 'Normal';
          else if (bmi >= 25 && bmi < 30) bmiCat = 'Overweight';
          else bmiCat = 'Obese';
        }

        newAthletes.push({
          name: athlete.name || 'Unnamed',
          age: parseInt(athlete.age) || 0,
          weight: weight,
          height: parseFloat(athlete.height) || 0,
          prodi: athlete.prodi || '',
          test_date: athlete.test_date || new Date().toISOString().split('T')[0],
          bmi: bmi,
          bmi_category: bmiCat,
          abq_score: parseInt(athlete.abq_pre) || 0,
          abq_post_score: parseInt(athlete.abq_post) || 0,
          sprint_pre: parseFloat(athlete.sprint_pre) || 0,
          sprint_post: parseFloat(athlete.sprint_post) || 0,
          cmj_pre: parseFloat(athlete.cmj_pre) || 0,
          cmj_post: parseFloat(athlete.cmj_post) || 0,
          hop_pre: ((parseFloat(athlete.hop_kanan_pre)||0) + (parseFloat(athlete.hop_kiri_pre)||0))/2,
          hop_post: ((parseFloat(athlete.hop_kanan_post)||0) + (parseFloat(athlete.hop_kiri_post)||0))/2,
          hop_kanan_pre: parseFloat(athlete.hop_kanan_pre) || 0,
          hop_kiri_pre: parseFloat(athlete.hop_kiri_pre) || 0,
          hop_kanan_post: parseFloat(athlete.hop_kanan_post) || 0,
          hop_kiri_post: parseFloat(athlete.hop_kiri_post) || 0,
          researcher_id: researcher?.id ?? 'd3b07384-d113-49cd-a5d6-89d023b12345'
        });
      }

      try {
        setToast({ message: \`Mengimpor \${newAthletes.length} data...\`, type: 'info', key: Date.now() });
        const { error } = await supabase.from('athletes').insert(newAthletes);
        if (error) throw error;
        setToast({ message: 'Import CSV Berhasil!', type: 'success', key: Date.now() });
        fetchSupabaseAthletes(); // reload
      } catch (err) {
        setToast({ message: 'Gagal Import: ' + err.message, type: 'error', key: Date.now() });
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };
`;

if (!adminCode.includes('handleImportCSV')) {
  adminCode = adminCode.replace('const handleDeleteAthlete = async (id) => {', importLogic + '\n  const handleDeleteAthlete = async (id) => {');
}

fs.writeFileSync('app/admin/page.jsx', adminCode, 'utf-8');
console.log('Fixed admin page');

// 3. Fix StudyContext.jsx to handle datetime-local format
let ctxCode = fs.readFileSync('context/StudyContext.jsx', 'utf-8');
// No fix needed strictly as test_date stores whatever string we pass. But let's check it.
console.log('All patches applied');
