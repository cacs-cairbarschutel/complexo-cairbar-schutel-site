const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory && !dirPath.includes('.git')) {
            walkDir(dirPath, callback);
        } else if (dirPath.endsWith('.html')) {
            callback(dirPath);
        }
    });
}

const dir = 'c:/Users/Mariana/cairbar-site';

walkDir(dir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // determine path to cacs.html depending on current file depth
    let cacsLink = 'pages/cacs.html';
    
    // Check depth
    let relative = path.relative(dir, filePath);
    let depth = relative.split(path.sep).length - 1;

    if (depth === 1) {
        cacsLink = '../pages/cacs.html';
    }
    
    // Special case if we are inside pages/ already
    if (relative.startsWith('pages' + path.sep)) {
        cacsLink = 'cacs.html';
    }

    // Attempt replacing the specific string.
    content = content.replace(/<a href="[^"]*index\.html#impacto">O CACS<\/a>/g, `<a href="${cacsLink}">O CACS</a>`);

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});
