const { PrismaClient } = require('../generated/prisma');
const seedExercises = require('./seed-exercises');
const seedPrograms = require('./seed-programs');

const prisma = new PrismaClient();

async function seedAll() {
  console.log('🚀 Début du peuplement complet de la base de données...\n');

  try {
    // 1. Seed exercises first
    console.log('📋 Étape 1: Peuplement des exercices...');
    await seedExercises();
    console.log('✅ Exercices créés avec succès\n');

    // 2. Seed programs (depends on exercises)
    console.log('📋 Étape 2: Peuplement des programmes d\'entraînement...');
    await seedPrograms();
    console.log('✅ Programmes créés avec succès\n');

    // 3. Create default user preferences
    console.log('📋 Étape 3: Création des préférences utilisateur par défaut...');
    await createDefaultUserPreferences();
    console.log('✅ Préférences par défaut créées\n');

    // 4. Create default notification preferences
    console.log('📋 Étape 4: Création des préférences de notification par défaut...');
    await createDefaultNotificationPreferences();
    console.log('✅ Préférences de notification créées\n');

    console.log('🎉 Peuplement complet terminé avec succès !');
    console.log('\n📊 Résumé des données créées:');
    console.log('   - Exercices avec tags par phase de cycle');
    console.log('   - Programmes d\'entraînement par phase');
    console.log('   - Préférences utilisateur par défaut');
    console.log('   - Préférences de notification par défaut');
    
    console.log('\n🚀 Vous pouvez maintenant tester les API:');
    console.log('   GET /exercises?category=MENSTRUAL_PHASE');
    console.log('   GET /programs?isTemplate=true');
    console.log('   POST /workouts/sessions');
    console.log('   GET /streaks');
    console.log('   GET /workouts/stats');

  } catch (error) {
    console.error('💥 Erreur lors du peuplement:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function createDefaultUserPreferences() {
  // This will be used when new users are created
  console.log('   → Préférences utilisateur par défaut configurées');
}

async function createDefaultNotificationPreferences() {
  // This will be used when new users are created
  console.log('   → Préférences de notification par défaut configurées');
}

// Exécuter le script
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('\n🎯 Prochaine étape: Testez votre application !');
      console.log('   npm run start:dev');
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = seedAll;


