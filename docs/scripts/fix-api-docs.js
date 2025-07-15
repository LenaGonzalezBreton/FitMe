const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fonction pour corriger les valeurs undefined dans les fichiers MDX
function fixUndefinedValues(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplace les propriétés undefined par des valeurs par défaut ou les supprime
  content = content.replace(/\s+id=\{undefined\}/g, '');
  content = content.replace(/\s+label=\{undefined\}/g, '');
  content = content.replace(/\s+title=\{undefined\}/g, '');
  
  // Pour StatusCodes, on peut aussi fournir des valeurs par défaut
  content = content.replace(
    /<StatusCodes([^>]*?)>/g, 
    (match, attributes) => {
      // Si pas d'id, on en ajoute un basé sur le nom du fichier
      if (!attributes.includes('id=')) {
        const fileName = path.basename(filePath, '.api.mdx');
        attributes += ` id="${fileName}-responses"`;
      }
      return `<StatusCodes${attributes}>`;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Corrigé: ${filePath}`);
}

// Trouve tous les fichiers MDX d'API et les corrige
const apiFiles = glob.sync('docs/api/**/*.api.mdx');
console.log(`🔧 Correction de ${apiFiles.length} fichiers API...`);

apiFiles.forEach(fixUndefinedValues);

console.log('✅ Tous les fichiers API ont été corrigés !'); 