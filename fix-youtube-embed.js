const fs = require('fs');

const embedHelper = `
// Helper to ensure youtube links are in embed format
const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  
  try {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
      return \`https://www.youtube.com/embed/\${videoId}\`;
    }
  } catch(e) {}
  
  return url;
};
`;

const files = ['app/sesi-1/page.jsx', 'app/sesi-2/page.jsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('const getEmbedUrl')) {
    // Inject the helper after the imports
    const importMatch = content.match(/import.*?;\n+/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + embedHelper + '\n');
    } else {
      content = embedHelper + '\n' + content;
    }
  }
  
  // Replace the src
  content = content.replace(/src=\{\`\$\{currentTestData\.videoUrl\}\?rel=0\`\}/g, 'src={`${getEmbedUrl(currentTestData.videoUrl)}?rel=0`}');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Fixed youtube embed rendering in sesi-1 and sesi-2');
