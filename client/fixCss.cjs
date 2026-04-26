const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, 'src', 'modules');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(modulesDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Replace import './Something.css' with the correct path if it's from another module
    // We moved Something.css to src/modules/something/Something.css or it might be in the same folder if we renamed it.
    // Actually, in our refactor script we did:
    // moduleName = name.replace(/Page$/, '').toLowerCase();
    // fs.renameSync(fullPath, path.join(modulePath, file));
    
    // So 'OrdersPage.css' is now in 'src/modules/orders/OrdersPage.css'
    
    content = content.replace(/import\s+['"]\.\/([^'"]+\.css)['"]/g, (match, cssFile) => {
        // Does this file exist in the same directory?
        const currentDir = path.dirname(filePath);
        if (fs.existsSync(path.join(currentDir, cssFile))) {
            return match; // It's in the same directory
        } else {
            // It must be in another module.
            // Let's guess the module name from the css file name
            let modName = cssFile.replace(/Page\.css$/, '').toLowerCase();
            if (!modName) modName = cssFile.toLowerCase();
            if (modName.endsWith('.css')) modName = modName.replace('.css', '');
            
            // The file is at @/modules/modName/cssFile
            changed = true;
            return `import '@/modules/${modName}/${cssFile}'`;
        }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }
});

console.log('Fixed CSS imports.');
