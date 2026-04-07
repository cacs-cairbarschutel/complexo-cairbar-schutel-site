const fs = require('fs');
const path = require('path');

function updateHtmlFiles(directory) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'assets') {
            updateHtmlFiles(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Determine level to correctly path `pages/transparencia.html`
            const isRoot = directory === '.';
            const pagesPrefix = isRoot ? 'pages/' : '../pages/';
            const indexPrefix = isRoot ? 'index.html#impacto' : '../index.html#impacto';
            
            const match = content.match(/<li><a href=.*?SOBRE NÓS<\/a><\/li>/);
            if (match) {
                const replacement = `<li class="dropdown-wrapper">
                        <a href="${indexPrefix}" style="display: flex; align-items: center; gap: 5px;">SOBRE NÓS <span style="font-size: 0.6rem;">▼</span></a>
                        <ul class="dropdown-menu">
                            <li><a href="${indexPrefix}">O CACS</a></li>
                            <li><a href="${pagesPrefix}transparencia.html">Transparência</a></li>
                        </ul>
                    </li>`;
                
                content = content.replace(/<li><a href=.*?SOBRE NÓS<\/a><\/li>/, replacement);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated ' + fullPath);
            }
        }
    }
}

updateHtmlFiles('.');
console.log('Done mapping.');
