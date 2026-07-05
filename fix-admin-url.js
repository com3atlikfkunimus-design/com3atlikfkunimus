const fs = require('fs');
const file = 'app/admin/page.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const normalizeUrl =')) {
  const normFn = `  const normalizeUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
  };

  // Dashboard Sub-menus state`;
  content = content.replace('  // Dashboard Sub-menus state', normFn);
  
  content = content.replace(/href=\{selectedAthleteForVideo\.videoUrls\.sprint_pre\}/g, 'href={normalizeUrl(selectedAthleteForVideo.videoUrls.sprint_pre)}');
  content = content.replace(/href=\{selectedAthleteForVideo\.videoUrls\.cmj_pre\}/g, 'href={normalizeUrl(selectedAthleteForVideo.videoUrls.cmj_pre)}');
  content = content.replace(/href=\{selectedAthleteForVideo\.videoUrls\.hop_pre\}/g, 'href={normalizeUrl(selectedAthleteForVideo.videoUrls.hop_pre)}');
  
  content = content.replace(/href=\{selectedAthleteForVideo\.videoUrls\.sprint_post\}/g, 'href={normalizeUrl(selectedAthleteForVideo.videoUrls.sprint_post)}');
  content = content.replace(/href=\{selectedAthleteForVideo\.videoUrls\.cmj_post\}/g, 'href={normalizeUrl(selectedAthleteForVideo.videoUrls.cmj_post)}');
  content = content.replace(/href=\{selectedAthleteForVideo\.videoUrls\.hop_post\}/g, 'href={normalizeUrl(selectedAthleteForVideo.videoUrls.hop_post)}');
  
  content = content.replace(/href=\{selectedAthleteForVideo\.reflexology_receipt\}/g, 'href={normalizeUrl(selectedAthleteForVideo.reflexology_receipt)}');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed URLs in app/admin/page.jsx');
}
