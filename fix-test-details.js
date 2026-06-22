const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'app/sesi-1/page.jsx'),
  path.join(__dirname, 'app/sesi-2/page.jsx')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Replace usages inside component body (not the global TEST_DETAILS)
  content = content.replace(/Memulai Latihan Simulasi untuk \$\{TEST_DETAILS\[activeTestId\]\.title\}/g, 'Memulai Latihan Simulasi untuk ${testDetails[activeTestId].title}');
  content = content.replace(/const currentTestData = activeTestId \? TEST_DETAILS\[activeTestId\] : null;/g, 'const currentTestData = activeTestId ? testDetails[activeTestId] : null;');
  content = content.replace(/Object\.values\(TEST_DETAILS\)\.map/g, 'Object.values(testDetails).map');
  content = content.replace(/Hasil skor \$\{TEST_DETAILS\[activeTestId\]\.title\}/g, 'Hasil skor ${testDetails[activeTestId].title}');
  content = content.replace(/\$\{TEST_DETAILS\[activeTestId\]\.unit\}/g, '${testDetails[activeTestId].unit}');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}
