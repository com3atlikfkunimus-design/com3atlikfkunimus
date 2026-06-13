const fs = require('fs');

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // 1. Remove modal state
  code = code.replace(
    /  \/\/ Pop-up & Wajib Baca Countdown State \(Slide 5\)[\s\S]*?const \[isModalBtnActive, setIsModalBtnActive\] = useState\(false\);/,
    '  // Pop-up & Wajib Baca Countdown State (Slide 5) - REMOVED per user request'
  );

  // 2. Bypass modal in handleSelectTest
  code = code.replace(
    /  \/\/ Select test card \(Slide 4\)[\s\S]*?setShowTutorial\(true\);\n  \};/,
    `  // Select test card (Slide 4)
  const handleSelectTest = (testId) => {
    setActiveTestId(testId);
    setViewState('testing');
  };`
  );

  // 3. Remove modal JSX
  code = code.replace(
    /      \{\/\* ── SLIDE PAGE 5 POP-UP ALUR: PROTEKSI TATA CARA WAJIB BACA ── \*\/\}[\s\S]*?<\/ResearchPageLayout>/,
    '    </ResearchPageLayout>'
  );

  // 4. Add progress state (only if not already there)
  if (!code.includes('const [uploadProgress')) {
    code = code.replace(
      '  // Toast State\n  const [toast, setToast] = useState(null);',
      '  // Toast State\n  const [toast, setToast] = useState(null);\n\n  // Upload Progress Fake State\n  const [uploadProgress, setUploadProgress] = useState(0);'
    );
  }

  // 5. Add upload logic
  if (!code.includes('setUploadProgress(0)')) {
    code = code.replace(
      /    handleStateChange\('isUploading', true\);\n    setToast\(\{ message: 'Sedang mengunggah video ke Supabase...', type: 'info', key: Date\.now\(\) \}\);\n\n    try \{\n      const url = await uploadVideo\(file, activeTestId\);\n      if \(url\) \{/,
      `    handleStateChange('isUploading', true);
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 500);

    setToast({ message: 'Sedang mengunggah video ke Supabase...', type: 'info', key: Date.now() });

    try {
      const url = await uploadVideo(file, activeTestId);
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (url) {`
    );

    code = code.replace(
      /      \}\n    \} catch \(err\) \{\n      handleStateChange\('isUploading', false\);/,
      `      }
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      handleStateChange('isUploading', false);`
    );
  }

  // 6. UI Update
  code = code.replace(
    /                \{currentTestState\.isUploading \? \([\s\S]*?                \) : currentTestState\.hasVideo \? \(/,
    `                {currentTestState.isUploading ? (
                  <div className="flex flex-col items-center w-full max-w-xs">
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: \`\${uploadProgress}%\` }}></div>
                    </div>
                    <p className="text-xs font-bold text-slate-800 uppercase">Mengunggah Video... {uploadProgress}%</p>
                    <p className="text-[10px] text-slate-500 mt-1">Mohon tunggu, jangan tutup halaman ini.</p>
                  </div>
                ) : currentTestState.hasVideo ? (`
  );

  // 7. Contrast updates
  code = code.split('text-slate-400').join('text-slate-500');
  code = code.split('border-slate-100').join('border-slate-200');

  fs.writeFileSync(filePath, code);
}

try {
  processFile('app/sesi-1/page.jsx');
  processFile('app/sesi-2/page.jsx');
  console.log('Success');
} catch (e) {
  console.error(e);
}
