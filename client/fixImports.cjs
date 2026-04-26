const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(clientDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Fix context imports
    content = content.replace(/['"](\.\.\/)*context\/([^'"]+)['"]/g, "'@/app/providers/$2'");
    content = content.replace(/['"]\.\/context\/([^'"]+)['"]/g, "'@/app/providers/$1'"); // specific for App.jsx
    
    // Fix pages imports
    content = content.replace(/['"](\.\.\/)*pages\/([^'"]+)['"]/g, (match, prefix, moduleStr) => {
        // e.g. "pages/HomePage" -> module="HomePage"
        let modName = moduleStr.replace(/Page$/, '').toLowerCase();
        if (!modName) modName = moduleStr.toLowerCase();
        if (moduleStr.includes('admin/')) {
           return `'@/modules/${moduleStr}'`; // Wait, we moved admin pages to modules/admin/
        }
        return `'@/modules/${modName}'`; 
    });
    
    content = content.replace(/['"]\.\/pages\/([^'"]+)['"]/g, (match, moduleStr) => {
        let modName = moduleStr.replace(/Page$/, '').toLowerCase();
        if (!modName) modName = moduleStr.toLowerCase();
        if (moduleStr.includes('admin/')) {
           return `'@/modules/${moduleStr}'`;
        }
        return `'@/modules/${modName}'`; 
    });

    // Fix component imports (if we moved them, but we didn't move them yet)
    // Actually we didn't move components yet. Let's just fix the context and pages.

    fs.writeFileSync(filePath, content, 'utf-8');
  }
});

console.log('Imports updated.');
