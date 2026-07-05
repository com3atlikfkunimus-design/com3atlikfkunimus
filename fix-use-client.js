const fs = require('fs');
['app/sesi-1/page.jsx', 'app/sesi-2/page.jsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find where the helper is
  const helperStart = content.indexOf('// Helper to ensure youtube links are in embed format');
  if (helperStart !== -1) {
    const helperEnd = content.indexOf('};', helperStart) + 3;
    const helperCode = content.substring(helperStart, helperEnd);
    
    // Remove the helper from its current location
    content = content.replace(helperCode, '');
    
    // We must ensure 'use client'; is at the VERY top
    const useClientIndex = content.indexOf("'use client';");
    const useClientIndex2 = content.indexOf('"use client";');
    let idx = -1;
    if (useClientIndex !== -1) idx = useClientIndex + 13;
    else if (useClientIndex2 !== -1) idx = useClientIndex2 + 13;
    
    if (idx !== -1) {
      // Put the helper right after 'use client';
      content = content.slice(0, idx) + '\n\n' + helperCode + '\n' + content.slice(idx);
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed use client directive in', file);
  } else {
    console.log('Helper not found in', file);
  }
});
