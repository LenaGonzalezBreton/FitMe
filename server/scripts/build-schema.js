const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================
const SCRIPT_DIR = __dirname;
const SERVER_DIR = path.dirname(SCRIPT_DIR);
const PRISMA_DIR = path.join(SERVER_DIR, 'prisma');
const OUTPUT_FILE = path.join(PRISMA_DIR, 'schema.prisma');

const DIRS_TO_SCAN = {
  base: path.join(PRISMA_DIR, 'base'),
  enums: path.join(PRISMA_DIR, 'enums'),
  models: path.join(PRISMA_DIR, 'models'),
};

// =============================================================================
// LOGIQUE DU SCRIPT
// =============================================================================

console.log('🔄 Lancement du script de construction automatique du schéma Prisma...');
console.log(`   Fichier de sortie : ${path.relative(SERVER_DIR, OUTPUT_FILE)}`);

/**
 * Récupère tous les fichiers .prisma dans un répertoire de manière récursive.
 * @param {string} dir - Le répertoire à scanner.
 * @returns {string[]} Une liste des chemins de fichiers.
 */
function getPrismaFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.warn(`   -> ⚠️ Le dossier n'existe pas : ${path.relative(SERVER_DIR, dir)}, il sera ignoré.`);
    return [];
  }

  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(getPrismaFiles(fullPath));
    } else if (path.extname(item) === '.prisma') {
      files.push(fullPath);
    }
  }
  return files.sort(); // Trier pour un ordre constant
}

/**
 * Construit le schéma final en concaténant les fichiers partiels.
 */
function buildSchema() {
  console.log('   -> Assemblage des modules de schéma...');

  let finalSchemaContent = `// =============================================================================
// ATTENTION : Fichier auto-généré par le script 'build-schema.js'.
// NE PAS MODIFIER CE FICHIER DIRECTEMENT.
//
// Pour faire des changements, modifiez les fichiers sources dans :
// - /prisma/base/
// - /prisma/enums/
// - /prisma/models/
// =============================================================================\n\n`;

  const processDirectory = (directoryPath, header) => {
    const files = getPrismaFiles(directoryPath);
    if (files.length > 0) {
      console.log(`      - Ajout des fichiers de : ${path.relative(PRISMA_DIR, directoryPath)}`);
      if (header) {
        finalSchemaContent += `// --- ${header} ---\n`;
      }
      files.forEach(file => {
        finalSchemaContent += fs.readFileSync(file, 'utf8') + '\n\n';
      });
    }
  };

  // 1. Fichiers de base (datasource, generator)
  processDirectory(DIRS_TO_SCAN.base);

  // 2. Fichiers Enums
  processDirectory(DIRS_TO_SCAN.enums, 'ÉNUMÉRATIONS');

  // 3. Fichiers Modèles
  processDirectory(DIRS_TO_SCAN.models, 'MODÈLES DE DONNÉES');

  // Écriture du fichier final
  fs.writeFileSync(OUTPUT_FILE, finalSchemaContent, 'utf8');
  console.log(`✅ Schéma Prisma généré avec succès !`);
}

// =============================================================================
// EXÉCUTION
// =============================================================================
try {
  buildSchema();
} catch (error) {
  console.error('❌ Une erreur est survenue lors de la construction du schéma :', error);
  process.exit(1);
} 