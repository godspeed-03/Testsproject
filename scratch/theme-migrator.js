const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-slate-900\/[0-9]+/g, replace: 'bg-card' },
  { search: /bg-slate-900/g, replace: 'bg-card' },
  { search: /bg-slate-800\/[0-9]+/g, replace: 'bg-muted' },
  { search: /bg-slate-800/g, replace: 'bg-muted' },
  { search: /text-slate-400/g, replace: 'text-muted-foreground' },
  { search: /text-slate-300/g, replace: 'text-foreground/90' },
  { search: /text-white/g, replace: 'text-foreground' },
  { search: /border-slate-700\/[0-9]+/g, replace: 'border-border' },
  { search: /border-slate-700/g, replace: 'border-border' },
  { search: /border-slate-600/g, replace: 'border-border' },
  { search: /text-slate-500/g, replace: 'text-muted-foreground' },
  // Undo some bad replacements made by previous tool call
  { search: /bg-slate-50/g, replace: 'bg-card' },
  { search: /text-slate-900/g, replace: 'text-foreground' },
  { search: /border-slate-200/g, replace: 'border-border' }
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
console.log('Migration complete');
