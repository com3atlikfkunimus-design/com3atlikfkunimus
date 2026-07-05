const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// The helper code we need to extract and move
const helperCodeStart = "  const datesWithTests = useMemo(() => {";
const helperCodeEnd = "    return null;\n  };\n";

const startIdx = content.indexOf(helperCodeStart);
const endIdx = content.indexOf(helperCodeEnd) + helperCodeEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  const helperCode = content.substring(startIdx, endIdx);
  
  // Remove it from its current position
  content = content.slice(0, startIdx) + content.slice(endIdx);
  
  // Find the real component return statement
  const componentReturnIdx = content.lastIndexOf('  return (\n    <ResearchPageLayout');
  
  if (componentReturnIdx !== -1) {
    // Insert it right before the return statement
    content = content.slice(0, componentReturnIdx) + helperCode + '\n' + content.slice(componentReturnIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully fixed helper code location!');
  } else {
    console.log('Could not find component return.');
  }
} else {
  console.log('Could not find helper code block.');
}
