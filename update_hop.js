const fs = require('fs');

// --- UPDATE SESI-1 ---
let s1File = 'app/sesi-1/page.jsx';
let s1Code = fs.readFileSync(s1File, 'utf8');

// Update state initialization
s1Code = s1Code.replace(
  /hop: \{ isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', isSimulated: false \},/g,
  `hop: { isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', scoreKanan: '', scoreKiri: '', isSimulated: false },`
);

// Update Save logic
if (!s1Code.includes('hop_kanan_pre')) {
  s1Code = s1Code.replace(
    /const updates = \{\n\s*\[\`\$\{activeTestId\}_pre\`\]: parseFloat\(currentTestState\.score\) \|\| 0,\n\s*\[\`video_url_\$\{activeTestId\}\`\]: currentTestState\.link \|\| null,\n\s*\};/,
    `const updates = {};
                    if (activeTestId === 'hop') {
                      updates['hop_kanan_pre'] = parseFloat(currentTestState.scoreKanan) || 0;
                      updates['hop_kiri_pre'] = parseFloat(currentTestState.scoreKiri) || 0;
                      // Opsional: simpan rata-rata ke hop_pre agar tidak break kode lama
                      updates['hop_pre'] = ((parseFloat(currentTestState.scoreKanan) || 0) + (parseFloat(currentTestState.scoreKiri) || 0)) / 2;
                    } else {
                      updates[\`\$\{activeTestId\}_pre\`] = parseFloat(currentTestState.score) || 0;
                    }
                    updates[\`video_url_\$\{activeTestId\}\`] = currentTestState.link || null;`
  );

  // Update validation
  s1Code = s1Code.replace(
    /if \(\!currentTestState\.score\.trim\(\)\) \{/,
    `if ((activeTestId === 'hop' && (!currentTestState.scoreKanan || !currentTestState.scoreKiri)) || (activeTestId !== 'hop' && !currentTestState.score.trim())) {`
  );

  // Update success Toast
  s1Code = s1Code.replace(
    /message: \`Hasil skor \$\{TEST_DETAILS\[activeTestId\]\.title\} \(\$\{currentTestState\.score\} \$\{TEST_DETAILS\[activeTestId\]\.unit\}\) berhasil disimpan\!\`,/,
    `message: \`Hasil skor \$\{TEST_DETAILS[activeTestId].title\} \(\$\{activeTestId === 'hop' ? \`Kanan \$\{currentTestState.scoreKanan\}, Kiri \$\{currentTestState.scoreKiri\}\` : currentTestState.score\} \$\{TEST_DETAILS[activeTestId].unit\}\) berhasil disimpan!\`,`
  );

  // Update UI Inputs
  s1Code = s1Code.replace(
    /\{\/\* Score Input \*\/\}\n\s*<div className="space-y-1">[\s\S]*?<\/span>\n\s*<\/div>\n\s*<\/div>/,
    `{/* Score Input */}
              {activeTestId === 'hop' ? (
                <div className="flex gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kaki Kanan ({currentTestData.unit}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        placeholder="0"
                        value={currentTestState.scoreKanan}
                        onChange={(e) => handleStateChange('scoreKanan', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-8 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                      />
                      <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">{currentTestData.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kaki Kiri ({currentTestData.unit}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        placeholder="0"
                        value={currentTestState.scoreKiri}
                        onChange={(e) => handleStateChange('scoreKiri', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-8 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                      />
                      <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">{currentTestData.unit}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Hasil Skor Tes ({currentTestData.unit}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={\`Masukkan hasil \$\{currentTestData.unit\}\`}
                      value={currentTestState.score}
                      onChange={(e) => handleStateChange('score', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-12 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                    />
                    <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">
                      {currentTestData.unit}
                    </span>
                  </div>
                </div>
              )}`
  );
  
  fs.writeFileSync(s1File, s1Code);
  console.log('sesi-1 updated');
}


// --- UPDATE SESI-2 ---
let s2File = 'app/sesi-2/page.jsx';
let s2Code = fs.readFileSync(s2File, 'utf8');

s2Code = s2Code.replace(
  /hop: \{ isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', isSimulated: false \},/g,
  `hop: { isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', scoreKanan: '', scoreKiri: '', isSimulated: false },`
);

if (!s2Code.includes('hop_kanan_post')) {
  s2Code = s2Code.replace(
    /const updates = \{\n\s*\[\`\$\{activeTestId\}_post\`\]: parseFloat\(currentTestState\.score\) \|\| 0,\n\s*\[\`video_url_\$\{activeTestId\}_post\`\]: currentTestState\.link \|\| null,\n\s*\};/,
    `const updates = {};
                    if (activeTestId === 'hop') {
                      updates['hop_kanan_post'] = parseFloat(currentTestState.scoreKanan) || 0;
                      updates['hop_kiri_post'] = parseFloat(currentTestState.scoreKiri) || 0;
                      updates['hop_post'] = ((parseFloat(currentTestState.scoreKanan) || 0) + (parseFloat(currentTestState.scoreKiri) || 0)) / 2;
                    } else {
                      updates[\`\$\{activeTestId\}_post\`] = parseFloat(currentTestState.score) || 0;
                    }
                    updates[\`video_url_\$\{activeTestId\}_post\`] = currentTestState.link || null;`
  );

  s2Code = s2Code.replace(
    /if \(\!currentTestState\.score\.trim\(\)\) \{/,
    `if ((activeTestId === 'hop' && (!currentTestState.scoreKanan || !currentTestState.scoreKiri)) || (activeTestId !== 'hop' && !currentTestState.score.trim())) {`
  );

  s2Code = s2Code.replace(
    /message: \`Hasil skor \$\{TEST_DETAILS\[activeTestId\]\.title\} \(\$\{currentTestState\.score\} \$\{TEST_DETAILS\[activeTestId\]\.unit\}\) berhasil disimpan\!\`,/,
    `message: \`Hasil skor \$\{TEST_DETAILS[activeTestId].title\} \(\$\{activeTestId === 'hop' ? \`Kanan \$\{currentTestState.scoreKanan\}, Kiri \$\{currentTestState.scoreKiri\}\` : currentTestState.score\} \$\{TEST_DETAILS[activeTestId].unit\}\) berhasil disimpan!\`,`
  );

  s2Code = s2Code.replace(
    /\{\/\* Score Input \*\/\}\n\s*<div className="space-y-1">[\s\S]*?<\/span>\n\s*<\/div>\n\s*<\/div>/,
    `{/* Score Input */}
              {activeTestId === 'hop' ? (
                <div className="flex gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kaki Kanan ({currentTestData.unit}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        placeholder="0"
                        value={currentTestState.scoreKanan}
                        onChange={(e) => handleStateChange('scoreKanan', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-8 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                      />
                      <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">{currentTestData.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kaki Kiri ({currentTestData.unit}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        placeholder="0"
                        value={currentTestState.scoreKiri}
                        onChange={(e) => handleStateChange('scoreKiri', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-8 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                      />
                      <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">{currentTestData.unit}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Hasil Skor Tes ({currentTestData.unit}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={\`Masukkan hasil \$\{currentTestData.unit\}\`}
                      value={currentTestState.score}
                      onChange={(e) => handleStateChange('score', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-12 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                    />
                    <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">
                      {currentTestData.unit}
                    </span>
                  </div>
                </div>
              )}`
  );

  fs.writeFileSync(s2File, s2Code);
  console.log('sesi-2 updated');
}


// --- UPDATE ADMIN ---
let adminFile = 'app/admin/page.jsx';
let adminCode = fs.readFileSync(adminFile, 'utf8');

if (!adminCode.includes('hop_kanan_pre:')) {
  // Add to Edit Form state
  adminCode = adminCode.replace(
    /hop_pre: athlete\.hop_pre \|\| '',\n\s*hop_post: athlete\.hop_post \|\| '',/,
    `hop_pre: athlete.hop_pre || '',
      hop_post: athlete.hop_post || '',
      hop_kanan_pre: athlete.hop_kanan_pre || '',
      hop_kiri_pre: athlete.hop_kiri_pre || '',
      hop_kanan_post: athlete.hop_kanan_post || '',
      hop_kiri_post: athlete.hop_kiri_post || '',`
  );

  // Update Database query update logic
  adminCode = adminCode.replace(
    /hop_pre: parseFloat\(editForm\.hop_pre\) \|\| 0,\n\s*hop_post: parseFloat\(editForm\.hop_post\) \|\| 0,/,
    `hop_pre: ((parseFloat(editForm.hop_kanan_pre)||0) + (parseFloat(editForm.hop_kiri_pre)||0))/2,
        hop_post: ((parseFloat(editForm.hop_kanan_post)||0) + (parseFloat(editForm.hop_kiri_post)||0))/2,
        hop_kanan_pre: parseFloat(editForm.hop_kanan_pre) || 0,
        hop_kiri_pre: parseFloat(editForm.hop_kiri_pre) || 0,
        hop_kanan_post: parseFloat(editForm.hop_kanan_post) || 0,
        hop_kiri_post: parseFloat(editForm.hop_kiri_post) || 0,`
  );

  // Update Table Display for Hop
  adminCode = adminCode.replace(
    /\{a\.hop_pre \? a\.hop_pre : '0'\}c <br\/>&rarr; <br\/>\{a\.hop_post \? a\.hop_post : '0'\}c/,
    `Kn: {a.hop_kanan_pre||0}c | Kr: {a.hop_kiri_pre||0}c<br/>&rarr;<br/>Kn: {a.hop_kanan_post||0}c | Kr: {a.hop_kiri_post||0}c`
  );

  // Update the Edit Modal UI for Hop
  adminCode = adminCode.replace(
    /<div className="flex gap-4">\n\s*<div className="flex-1 space-y-1">\n\s*<label className="text-\[9px\] font-bold text-slate-600">Hop Pre<\/label>\n\s*<input \n\s*type="number" step="any"\n\s*value=\{editForm\.hop_pre\} \n\s*onChange=\{\(e\) => setEditForm\(\{ \.\.\.editForm, hop_pre: e\.target\.value \}\)\} \n\s*className="w-full bg-white border border-slate-200 focus:border-\[#2563eb\] rounded px-2 py-1\.5 text-xs outline-none" \n\s*\/>\n\s*<\/div>\n\s*<div className="flex-1 space-y-1">\n\s*<label className="text-\[9px\] font-bold text-slate-600">Hop Post<\/label>\n\s*<input \n\s*type="number" step="any"\n\s*value=\{editForm\.hop_post\} \n\s*onChange=\{\(e\) => setEditForm\(\{ \.\.\.editForm, hop_post: e\.target\.value \}\)\} \n\s*className="w-full bg-white border border-slate-200 focus:border-\[#2563eb\] rounded px-2 py-1\.5 text-xs outline-none" \n\s*\/>\n\s*<\/div>\n\s*<\/div>/,
    `<div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600">Hop Pre (Kanan | Kiri)</label>
                    <div className="flex gap-1">
                      <input type="number" step="any" placeholder="Kn" value={editForm.hop_kanan_pre} onChange={(e) => setEditForm({ ...editForm, hop_kanan_pre: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" />
                      <input type="number" step="any" placeholder="Kr" value={editForm.hop_kiri_pre} onChange={(e) => setEditForm({ ...editForm, hop_kiri_pre: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-600">Hop Post (Kanan | Kiri)</label>
                    <div className="flex gap-1">
                      <input type="number" step="any" placeholder="Kn" value={editForm.hop_kanan_post} onChange={(e) => setEditForm({ ...editForm, hop_kanan_post: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" />
                      <input type="number" step="any" placeholder="Kr" value={editForm.hop_kiri_post} onChange={(e) => setEditForm({ ...editForm, hop_kiri_post: e.target.value })} className="w-full bg-white border border-slate-200 focus:border-[#2563eb] rounded px-2 py-1.5 text-xs outline-none" />
                    </div>
                  </div>
                </div>`
  );

  fs.writeFileSync(adminFile, adminCode);
  console.log('admin page updated');
}

