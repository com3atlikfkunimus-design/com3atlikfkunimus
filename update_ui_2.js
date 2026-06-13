const fs = require('fs');

try {
  let adminPath = 'app/admin/page.jsx';
  let adminCode = fs.readFileSync(adminPath, 'utf-8');

  // Add isLoading state
  if (!adminCode.includes('const [isLoading, setIsLoading] = useState(true);')) {
    adminCode = adminCode.replace(
      'const [toast, setToast] = useState(null);',
      'const [toast, setToast] = useState(null);\n  const [isLoading, setIsLoading] = useState(true);'
    );
  }

  // Update fetchSupabaseAthletes to toggle isLoading
  if (!adminCode.includes('setIsLoading(false);')) {
    adminCode = adminCode.replace(
      /const fetchSupabaseAthletes = async \(\) => \{\n    if \(\!researcher\) return;\n    try \{/,
      `const fetchSupabaseAthletes = async () => {
    if (!researcher) return;
    setIsLoading(true);
    try {`
    );
    
    adminCode = adminCode.replace(
      /      setAthletes\(merged\);\n    \} catch \(err\) \{\n      console\.warn\('\[Supabase\] Failed to fetch athletes:', err\);\n    \}\n  \};/,
      `      setAthletes(merged);
    } catch (err) {
      console.warn('[Supabase] Failed to fetch athletes:', err);
    } finally {
      setIsLoading(false);
    }
  };`
    );
  }

  // Inject Skeleton Loader JSX before table if isLoading
  if (!adminCode.includes('animate-pulse bg-slate-100')) {
    adminCode = adminCode.replace(
      /<tbody className="divide-y divide-slate-50 text-slate-600">\n                  \{filteredAthletes\.length === 0 \? \(/,
      `<tbody className="divide-y divide-slate-50 text-slate-600">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={'skeleton-'+i}>
                        <td className="py-4 px-4"><div className="h-8 w-32 bg-slate-100 rounded animate-pulse"></div></td>
                        <td className="py-4 px-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse"></div></td>
                        <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse mx-auto"></div></td>
                        <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse mx-auto"></div></td>
                        <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse mx-auto"></div></td>
                        <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse mx-auto"></div></td>
                        <td className="py-4 px-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse mx-auto"></div></td>
                        <td className="py-4 px-4"><div className="h-6 w-24 bg-slate-100 rounded animate-pulse mx-auto"></div></td>
                        <td className="py-4 px-4"><div className="h-6 w-32 bg-slate-100 rounded animate-pulse ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredAthletes.length === 0 ? (`
    );
  }

  // Add micro animations (active:scale-95)
  adminCode = adminCode.replace(/cursor-pointer/g, 'cursor-pointer active:scale-95');
  adminCode = adminCode.replace(/hover:bg-slate-100 transition-colors/g, 'hover:bg-slate-100 transition-all duration-200 active:scale-95');
  
  fs.writeFileSync(adminPath, adminCode);
  console.log('Admin updated with skeletons and animations.');

  // Update Sesi 1 & 2 animations
  ['app/sesi-1/page.jsx', 'app/sesi-2/page.jsx'].forEach(path => {
    let code = fs.readFileSync(path, 'utf-8');
    code = code.replace(/cursor-pointer/g, 'cursor-pointer active:scale-95 transition-all');
    fs.writeFileSync(path, code);
  });
  console.log('Sesi pages updated with animations.');

} catch (e) {
  console.error(e);
}
