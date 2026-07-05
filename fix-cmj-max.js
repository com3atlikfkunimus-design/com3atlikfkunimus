const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "max: type === 'sprint' ? 10 : (type === 'cmj' ? 125 : (type === 'abq' ? 30 : 250)),";
const replacementStr = "max: type === 'sprint' ? 10 : (type === 'cmj' ? 200 : (type === 'abq' ? 30 : 250)),";

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated CMJ max to 200.');
} else {
  console.log('Could not find the target string for CMJ max.');
}
