const fs = require('fs');

// 1. Fix app/admin/page.jsx
let adminFile = 'app/admin/page.jsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');

adminContent = adminContent.replace(
  'test_date: db.test_date,',
  'test_date: db.created_at || db.test_date,'
);

adminContent = adminContent.replace(
  'test_date: editForm.test_date ? new Date(editForm.test_date).toISOString() : new Date().toISOString(),\n        name: editForm.name,',
  'test_date: editForm.test_date ? new Date(editForm.test_date).toISOString() : new Date().toISOString(),\n        created_at: editForm.test_date ? new Date(editForm.test_date).toISOString() : new Date().toISOString(),\n        name: editForm.name,'
);

adminContent = adminContent.replace(
  'test_date: athlete.test_date || new Date().toISOString().split(\'T\')[0],\n          bmi: bmi,',
  'test_date: athlete.test_date || new Date().toISOString().split(\'T\')[0],\n          created_at: athlete.test_date ? new Date(athlete.test_date).toISOString() : new Date().toISOString(),\n          bmi: bmi,'
);

adminContent = adminContent.replace(
  '// Auth guard\n  useEffect(() => {\n    if (isHydrated && !researcher) {\n      router.replace(\'/login\');\n    }\n  }, [isHydrated, researcher, router]);',
  `// Auth guard & Auto Logout
  useEffect(() => {
    if (isHydrated && !researcher) {
      router.replace('/login');
    }
    
    let timeoutId;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (researcher) {
          localStorage.removeItem('researcherData');
          window.location.href = '/login';
        }
      }, 15 * 60 * 1000); // 15 mins
    };

    if (researcher) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer();
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isHydrated, researcher, router]);`
);

fs.writeFileSync(adminFile, adminContent, 'utf8');

// 2. Fix app/registrasi/page.jsx
let regFile = 'app/registrasi/page.jsx';
let regContent = fs.readFileSync(regFile, 'utf8');

regContent = regContent.replace(
  'test_date: form.test_date,\n    });',
  'test_date: form.test_date,\n      created_at: new Date(form.test_date).toISOString(),\n    });'
);

fs.writeFileSync(regFile, regContent, 'utf8');

// 3. Fix app/sesi-1/page.jsx and app/sesi-2/page.jsx
const fixIframe = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(
    'className="w-full sm:w-32 aspect-video shrink-0 bg-slate-900 rounded overflow-hidden relative"',
    'className="w-full sm:w-80 aspect-video shrink-0 bg-slate-900 rounded-lg overflow-hidden relative shadow-lg"'
  );
  
  content = content.replace(
    'src={currentTestData.videoUrl}',
    'src={`${currentTestData.videoUrl}?rel=0`}'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
};

fixIframe('app/sesi-1/page.jsx');
fixIframe('app/sesi-2/page.jsx');

console.log('Done fixing bugs!');
