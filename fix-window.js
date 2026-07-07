const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove top-level import
content = content.replace("import zoomPlugin from 'chartjs-plugin-zoom';\n", "");

// 2. Remove top-level registration
content = content.replace("ChartJS.register(zoomPlugin, ", "ChartJS.register(");

// 3. Add dynamic import to an existing useEffect
const effectStartStr = "  useEffect(() => {\n    setIsHydrated(true);";
const newEffectStr = `  useEffect(() => {
    setIsHydrated(true);
    import('chartjs-plugin-zoom').then((plugin) => {
      ChartJS.register(plugin.default || plugin);
    }).catch(console.error);`;

if (content.includes(effectStartStr)) {
  content = content.replace(effectStartStr, newEffectStr);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed window is not defined error.');
