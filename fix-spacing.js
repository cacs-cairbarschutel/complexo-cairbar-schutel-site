const fs = require('fs');
let c = fs.readFileSync('pages/cacs.html', 'utf8');

// Replace padding of 60px 0 with 30px 0 for sections
c = c.replace(/<section style="padding: 60px 0; background-color: (var\(--secondary-color\)|#f9f9f9|#ffffff);/g, '<section style="padding: 30px 0; background-color: $1;');

// Remove margin-bottom: 50px; from the flex elements
c = c.replace(/; margin-bottom: 50px;/g, '');

// Reduce margin-bottom of headers from 40px/20px to just 20px to unify (already ok or can just reduce from 40px to 20px)
c = c.replace(/margin-bottom: 40px;/g, 'margin-bottom: 20px;');

fs.writeFileSync('pages/cacs.html', c);
console.log('Success spacing replace');
