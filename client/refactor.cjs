const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'src');
const modulesDir = path.join(clientDir, 'modules');
const pagesDir = path.join(clientDir, 'pages');

// Create module folders
if (fs.existsSync(pagesDir)) {
  const files = fs.readdirSync(pagesDir);
  files.forEach(file => {
    const fullPath = path.join(pagesDir, file);
    if (fs.statSync(fullPath).isFile()) {
      const ext = path.extname(file);
      const name = path.basename(file, ext);
      const isReactComponent = ext === '.jsx' || ext === '.js';
      
      let moduleName = name.replace(/Page$/, '').toLowerCase();
      if (!moduleName) moduleName = name.toLowerCase();

      const modulePath = path.join(modulesDir, moduleName);
      if (!fs.existsSync(modulePath)) {
        fs.mkdirSync(modulePath, { recursive: true });
      }

      // Rename to index.jsx if it's the main page component
      if (isReactComponent && name.endsWith('Page')) {
        fs.renameSync(fullPath, path.join(modulePath, `index${ext}`));
      } else {
        fs.renameSync(fullPath, path.join(modulePath, file));
      }
    }
  });

  // Handle admin subfolder
  const adminDir = path.join(pagesDir, 'admin');
  if (fs.existsSync(adminDir)) {
    const adminFiles = fs.readdirSync(adminDir);
    const adminModulePath = path.join(modulesDir, 'admin');
    if (!fs.existsSync(adminModulePath)) {
      fs.mkdirSync(adminModulePath, { recursive: true });
    }
    adminFiles.forEach(file => {
      fs.renameSync(path.join(adminDir, file), path.join(adminModulePath, file));
    });
    fs.rmdirSync(adminDir);
  }
  
  // Clean up pages
  try {
    fs.rmdirSync(pagesDir);
  } catch (e) {
    console.log("Could not remove pages dir, might not be empty");
  }
}

// 2. Move Contexts to app/providers
const contextDir = path.join(clientDir, 'context');
const providersDir = path.join(clientDir, 'app', 'providers');

if (fs.existsSync(contextDir)) {
  const contexts = fs.readdirSync(contextDir);
  contexts.forEach(file => {
    fs.renameSync(path.join(contextDir, file), path.join(providersDir, file));
  });
  try {
    fs.rmdirSync(contextDir);
  } catch(e) {}
}

console.log('Moved files to MVVM architecture folders.');
