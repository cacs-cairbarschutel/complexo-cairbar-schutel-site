const fs = require('fs');
let c = fs.readFileSync('pages/cacs.html', 'utf8');

c = c.replace(
    /<h2 style="margin-bottom: 0;">Equipe<\/h2>/g,
    '<h4 style="margin: 0; font-size: 1.8rem; text-align: center;">Equipe</h4>'
);

c = c.replace(
    /<div class="container fade-in-up text-center">\s*<h4 style="margin: 0; font-size: 1.8rem; text-align: center;">Equipe<\/h4>/g,
    '<div class="container fade-in-up text-center" style="display: flex; justify-content: center; align-items: center;">\n                <h4 style="margin: 0; font-size: 1.8rem; text-align: center;">Equipe</h4>'
);

fs.writeFileSync('pages/cacs.html', c);
console.log('Success regex replace');
