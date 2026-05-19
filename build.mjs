import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../SDC2026.html');

fs.mkdirSync(path.join(__dirname, 'assets/gallery'), { recursive: true });

let html = fs.readFileSync(src, 'utf8');

const imgRe = /<img class="fd-img" src="(data:image\/[^"]+)"/g;
const dataUrls = [];
let m;
while ((m = imgRe.exec(html)) !== null) dataUrls.push(m[1]);

const lbPaths = [];
for (let i = 0; i < dataUrls.length; i++) {
  const dataUrl = dataUrls[i];
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) continue;
  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const rel = `assets/gallery/${i}.${ext}`;
  fs.writeFileSync(path.join(__dirname, rel), Buffer.from(match[2], 'base64'));
  html = html.replace(dataUrl, rel);
  lbPaths.push(`'${rel}'`);
}

const lbStart = html.indexOf('const LB_SRCS = [');
const lbEnd = html.indexOf('];', lbStart) + 2;
if (lbStart > -1 && lbPaths.length) {
  html = html.slice(0, lbStart) + `const LB_SRCS = [${lbPaths.join(', ')}];` + html.slice(lbEnd);
}

html = html.replace('    </svg>\n    </svg>\n  </div>', '    </svg>\n  </div>');

html = html.replace('<button class="nb on" id="nav-schedule"', '<button class="nb" id="nav-schedule"');
html = html.replace('<button class="nb home-btn" id="nav-home"', '<button class="nb home-btn on" id="nav-home"');

if (!html.includes('id="galleryFilters"')) {
  html = html.replace(
    '<div class="fd-feed" id="feedContainer">',
    `<div style="padding:0 16px 12px;">
    <div class="filter-row" id="galleryFilters">
      <button type="button" class="fp on" data-filter="all" onclick="filt(this)">All</button>
      <button type="button" class="fp" data-filter="arch" onclick="filt(this)">Architecture</button>
      <button type="button" class="fp" data-filter="gd" onclick="filt(this)">Graphic Design</button>
      <button type="button" class="fp" data-filter="la" onclick="filt(this)">Landscape</button>
      <button type="button" class="fp" data-filter="ia" onclick="filt(this)">Interior Arch</button>
      <button type="button" class="fp" data-filter="final" onclick="filt(this)">Final Project</button>
    </div>
  </div>
  <div class="fd-feed" id="feedContainer">`
  );
}

const tracks = ['camp', 'arch', 'la', 'ia', 'camp', 'ia', 'final', 'gd', 'gd'];
let pi = 0;
html = html.replace(/<div class="fd-post"/g, () => {
  const t = tracks[pi++] || 'camp';
  return `<div class="fd-post" data-track="${t}"`;
});

html = html.replace(
  /charrBtn = '<button onclick="openCharrette\\([^)]+\\)"[^>]*>View Charrette Brief<\/button>';/,
  "charrBtn = '<button type=\"button\" class=\"charr-open-btn\" data-charrette=\"' + e.charrette + '\" style=\"width:100%;background:' + tc.p + ';border:1.5px solid rgba(0,0,0,.1);color:' + tc.c + ';border-radius:var(--r);padding:13px;font-family:var(--font-d);font-size:18px;font-weight:800;letter-spacing:.04em;cursor:pointer;margin-top:14px;\">View Charrette Brief</button>';"
);

if (!html.includes('poll-open-btn')) {
  html = html.replace(
    "  openOverlay('actOverlay');\n}\n\nfunction selDay",
    `  if (e.loc && e.loc.indexOf('Poll') !== -1) {
    document.getElementById('actContent').innerHTML +=
      '<button type="button" class="poll-open-btn" style="width:100%;background:var(--orange);border:none;color:white;border-radius:var(--r);padding:13px;font-family:var(--font-d);font-size:18px;font-weight:800;letter-spacing:.04em;cursor:pointer;margin-top:14px;">Open Tonight\\'s Poll</button>';
  }
  openOverlay('actOverlay');
}

function selDay`
  );
}

if (!html.includes("getElementById('actContent').addEventListener")) {
  html = html.replace(
    '// ---- INIT ----\nbuildDays();',
    `// ---- INIT ----
document.getElementById('actContent').addEventListener('click', function(ev) {
  var c = ev.target.closest('[data-charrette]');
  if (c && c.dataset.charrette) { openCharrette(c.dataset.charrette); return; }
  if (ev.target.closest('.poll-open-btn')) { closeOverlay('actOverlay'); openOverlay('pollOverlay'); }
});

buildDays();`
  );
}

html = html.replace(
  /function filt\(el\) \{[^}]*\}/,
  `function filt(el) {
  document.querySelectorAll('#galleryFilters .fp').forEach(function(b){ b.classList.remove('on'); });
  el.classList.add('on');
  var f = el.getAttribute('data-filter') || 'all';
  document.querySelectorAll('#feedContainer .fd-post').forEach(function(post) {
    post.style.display = (f === 'all' || post.getAttribute('data-track') === f) ? '' : 'none';
  });
}`
);

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('Built index.html', (fs.statSync(path.join(__dirname, 'index.html')).size / 1024).toFixed(0), 'KB');
