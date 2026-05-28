const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-slate-700\/[0-9]+/g, replace: 'bg-muted' },
  { search: /bg-slate-700/g, replace: 'bg-muted' },
  { search: /bg-slate-600/g, replace: 'bg-muted' },
  { search: /border-slate-800/g, replace: 'border-border' },
  { search: /border-slate-500/g, replace: 'border-border' },
  { search: /ring-offset-slate-800/g, replace: 'ring-offset-card' }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      replacements.forEach(({ search, replace }) => {
        if (search.test(content)) {
          content = content.replace(search, replace);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log('Migration 2 complete');
