const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

if (content.includes("import { useEffect, useState } from 'react';")) {
  content = content.replace(
    "import { useEffect, useState } from 'react';",
    "import { useEffect, useState, useMemo } from 'react';"
  );
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed useMemo import.');
} else {
  console.log('Could not find import to replace.');
}
