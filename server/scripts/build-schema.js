const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// =============================================================================
// CONFIGURATION
// =============================================================================
const SCRIPT_DIR = __dirname;
const SERVER_DIR = path.dirname(SCRIPT_DIR);
const PRISMA_DIR = path.join(SERVER_DIR, 'prisma');
const OUTPUT_FILE = path.join(PRISMA_DIR, 'schema.prisma');

const DIRS_TO_SCAN = {
  base: { path: path.join(PRISMA_DIR, 'base'), header: null },
  enums: { path: path.join(PRISMA_DIR, 'enums'), header: 'ÉNUMÉRATIONS' },
  models: { path: path.join(PRISMA_DIR, 'models'), header: 'MODÈLES DE DONNÉES' },
};

// Options depuis les arguments de ligne de commande
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  push: args.includes('--push'),
  seed: args.includes('--seed'),
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

  const files = [];
  
  const scanDirectory = (currentDir) => {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          scanDirectory(fullPath);
        } else if (item.isFile() && path.extname(item.name) === '.prisma') {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`   -> ❌ Erreur lors de la lecture du dossier ${currentDir}:`, error.message);
    }
  };

  scanDirectory(dir);
  return files.sort(); // Trier pour un ordre constant
}

/**
 * Lit et combine le contenu de plusieurs fichiers.
 * @param {string[]} files - Liste des chemins de fichiers
 * @returns {string} Contenu combiné
 */
function readAndCombineFiles(files) {
  return files
    .map(file => {
      try {
        return fs.readFileSync(file, 'utf8').trim();
      } catch (error) {
        console.error(`   -> ❌ Erreur lors de la lecture de ${file}:`, error.message);
        return '';
      }
    })
    .filter(content => content.length > 0)
    .join('\n\n');
}

/**
 * Vérifie si le rebuild est nécessaire en comparant les timestamps
 * @returns {boolean} True si le rebuild est nécessaire
 */
function shouldRebuild() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return true;
  }

  const outputStat = fs.statSync(OUTPUT_FILE);
  const outputTime = outputStat.mtime.getTime();

  for (const [dirName, { path: dir }] of Object.entries(DIRS_TO_SCAN)) {
    const files = getPrismaFiles(dir);
    
    for (const file of files) {
      const fileStat = fs.statSync(file);
      if (fileStat.mtime.getTime() > outputTime) {
        console.log(`   -> Modification détectée dans : ${path.relative(SERVER_DIR, file)}`);
        return true;
      }
    }
  }

  console.log('   -> Aucune modification détectée, skip du rebuild.');
  return false;
}

/**
 * Construit le schéma final en concaténant les fichiers partiels.
 */
function buildSchema() {
  console.log('   -> Assemblage des modules de schéma...');

  const schemaHeader = `// =============================================================================
// ATTENTION : Fichier auto-généré par le script 'build-schema.js'.
// NE PAS MODIFIER CE FICHIER DIRECTEMENT.
//
// Pour faire des changements, modifiez les fichiers sources dans :
// - /prisma/base/
// - /prisma/enums/
// - /prisma/models/
// =============================================================================\n\n`;

  const schemaContent = [schemaHeader];
  let totalFiles = 0;

  // Traitement de chaque répertoire dans l'ordre défini
  for (const [dirName, { path: directoryPath, header }] of Object.entries(DIRS_TO_SCAN)) {
    const files = getPrismaFiles(directoryPath);
    
    if (files.length === 0) {
      console.log(`      - Aucun fichier trouvé dans : ${dirName}`);
      continue;
    }

    console.log(`      - Ajout des fichiers de : ${dirName} (${files.length} fichier${files.length > 1 ? 's' : ''})`);
    totalFiles += files.length;
    
    if (header) {
      schemaContent.push(`// --- ${header} ---`);
    }
    
    const combinedContent = readAndCombineFiles(files);
    if (combinedContent) {
      schemaContent.push(combinedContent);
    }
  }

  // Écriture du fichier final avec gestion d'erreurs
  try {
    const finalContent = schemaContent.join('\n') + '\n';
    fs.writeFileSync(OUTPUT_FILE, finalContent, 'utf8');
    console.log(`✅ Schéma Prisma généré avec succès ! (${totalFiles} fichiers, ${finalContent.length} caractères)`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture du fichier final :', error.message);
    throw error;
  }
}

/**
 * Exécute une commande système avec gestion d'erreurs
 * @param {string} command - La commande à exécuter
 * @param {string} description - Description de l'action
 * @returns {boolean} True si succès, False si échec
 */
function executeCommand(command, description) {
  try {
    console.log(`   -> ${description}...`);
    execSync(command, { 
      cwd: SERVER_DIR, 
      stdio: 'inherit',
      timeout: 120000 // 2 minutes timeout
    });
    console.log(`   ✅ ${description} terminé avec succès`);
    return true;
  } catch (error) {
    console.error(`   ❌ Erreur lors de ${description.toLowerCase()}:`);
    console.error(`      Commande: ${command}`);
    console.error(`      Erreur: ${error.message}`);
    return false;
  }
}

/**
 * Exécute le push de la base de données
 * @returns {boolean} True si succès
 */
function executePush() {
  console.log('\n🔄 Push de la base de données...');
  return executeCommand('npm run prisma:push', 'Push de la base de données');
}

/**
 * Exécute les seeders si disponibles
 * @returns {boolean} True si succès
 */
function executeSeed() {
  console.log('\n🌱 Exécution des seeders...');
  
  // Vérifier quels scripts de seed sont disponibles
  const packageJsonPath = path.join(SERVER_DIR, 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const seedScripts = Object.keys(scripts).filter(script => 
      script.startsWith('demo:') || script.includes('seed')
    );
    
    if (seedScripts.length === 0) {
      console.log('   ⚠️ Aucun script de seed trouvé dans package.json');
      return true;
    }
    
    console.log(`   -> Scripts de seed disponibles: ${seedScripts.join(', ')}`);
    
    // Exécuter les scripts de demo/seed
    for (const script of seedScripts) {
      if (!executeCommand(`npm run ${script}`, `Exécution du script ${script}`)) {
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error(`   ❌ Erreur lors de la lecture de package.json:`, error.message);
    return false;
  }
}

// =============================================================================
// EXÉCUTION
// =============================================================================

/**
 * Fonction principale d'exécution
 */
async function main() {
  try {
    // Afficher les options activées
    if (options.force || options.push || options.seed) {
      console.log('📋 Options activées:', Object.entries(options)
        .filter(([_, value]) => value)
        .map(([key, _]) => `--${key}`)
        .join(', ')
      );
    }

    // Vérifier si le rebuild est nécessaire (sauf si --force)
    if (!options.force && !shouldRebuild()) {
      console.log('⏭️ Schema à jour, aucune action nécessaire.');
      
      // Même si le schema n'a pas changé, on peut faire push/seed si demandé
      if (options.push || options.seed) {
        console.log('🔄 Mais exécution des actions supplémentaires demandées...');
      } else {
        return;
      }
    } else {
      // Build du schema
      const buildSuccess = buildSchema();
      if (!buildSuccess) {
        throw new Error('Échec de la construction du schéma');
      }
    }

    // Push en base de données si demandé
    if (options.push) {
      const pushSuccess = executePush();
      if (!pushSuccess) {
        throw new Error('Échec du push en base de données');
      }
    }

    // Exécution des seeders si demandé
    if (options.seed) {
      const seedSuccess = executeSeed();
      if (!seedSuccess) {
        throw new Error('Échec de l\'exécution des seeders');
      }
    }

    // Message final de succès
    console.log('\n🎉 Toutes les opérations ont été exécutées avec succès !');
    
    if (options.push || options.seed) {
      console.log('💡 Tips: Vous pouvez maintenant utiliser npm run prisma:studio pour explorer votre base de données');
    }

  } catch (error) {
    console.error('\n❌ Une erreur est survenue :', error.message);
    console.error('\n🔍 Aide:');
    console.error('  - Vérifiez que votre base de données est accessible');
    console.error('  - Utilisez --force pour forcer le rebuild du schema');
    console.error('  - Utilisez --push pour pousser les changements en base');
    console.error('  - Utilisez --seed pour exécuter les seeders');
    console.error('\nExemples:');
    console.error('  npm run prisma:build');
    console.error('  npm run prisma:build -- --force --push --seed');
    process.exit(1);
  }
}

// Point d'entrée
main();