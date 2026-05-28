const fs = require('fs');

let layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
layout = layout.replace('bg-card text-slate-50', 'bg-background text-foreground');
fs.writeFileSync('src/app/layout.tsx', layout);

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navbar = navbar.replace('text-slate-200', 'text-foreground/90');
fs.writeFileSync('src/components/Navbar.tsx', navbar);

let page = fs.readFileSync('src/app/page.tsx', 'utf8');
page = page.replace('text-slate-100', 'text-foreground');
fs.writeFileSync('src/app/page.tsx', page);

console.log('Fixed 3 text colors');
