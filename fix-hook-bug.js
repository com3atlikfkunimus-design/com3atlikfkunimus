const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const helperCodeStart = "  const datesWithTests = useMemo(() => {";
const helperCodeEnd = "    return null;\n  };\n";

const startIdx = content.indexOf(helperCodeStart);
const endIdx = content.indexOf(helperCodeEnd) + helperCodeEnd.length;

if (startIdx !== -1 && endIdx !== -1) {
  const helperCode = content.substring(startIdx, endIdx);
  
  // Remove it from its current position
  content = content.slice(0, startIdx) + content.slice(endIdx);
  
  // Insert it right after the state hooks
  const insertTarget = "const [showCalendar, setShowCalendar] = useState(false);";
  const targetIdx = content.indexOf(insertTarget);
  
  if (targetIdx !== -1) {
    // Insert it right after
    content = content.slice(0, targetIdx + insertTarget.length) + '\n\n' + helperCode + content.slice(targetIdx + insertTarget.length);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully fixed React hook location!');
  } else {
    console.log('Could not find insertion target.');
  }
} else {
  console.log('Could not find helper code block.');
}
