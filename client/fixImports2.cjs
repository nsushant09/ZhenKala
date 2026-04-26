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

const foldersToAlias = ['components', 'services', 'hooks', 'assets', 'utils', 'config'];

walkDir(clientDir, (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    foldersToAlias.forEach(folder => {
      // Replace ../../folder or ../folder with @/folder
      const regex = new RegExp(`['"](\\.\\.\\/)+${folder}\\/([^'"]+)['"]`, 'g');
      const result = content.replace(regex, `'@/${folder}/$2'`);
      if (result !== content) {
        content = result;
        changed = true;
      }
      
      // Also handle ./components/ if needed but ./ is relative to same folder. Let's leave ./ unless it's in a moved folder.
      // Actually since we moved files from src/pages to src/modules/<name>, a ./components/ inside pages would have been wrong anyway.
      // Wait, in src/pages it was ../components.
      // Let's replace any relative import that ends up in these folders.
      // But just ../ and ../../ is safer.
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }
});

console.log('Fixed additional imports.');
