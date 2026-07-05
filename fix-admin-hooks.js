const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the early return from its current place
const earlyReturnBlock = `  if (!isHydrated || !researcher) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }`;

if (content.includes(earlyReturnBlock)) {
  content = content.replace(earlyReturnBlock, '');
  
  const injectTarget = '  return (\n    <ResearchPageLayout';
  if (content.includes(injectTarget)) {
    content = content.replace(injectTarget, earlyReturnBlock + '\n\n' + injectTarget);
  } else {
    // try another target
    const altTarget = '  return (\n    <div className="min-h-screen';
    if (content.includes(altTarget)) {
      content = content.replace(altTarget, earlyReturnBlock + '\n\n' + altTarget);
    }
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed Rules of Hooks violation in app/admin/page.jsx');
} else {
  console.log('Could not find early return block');
}
