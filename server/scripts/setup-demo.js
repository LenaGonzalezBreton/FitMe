const seedExercises = require('./seed-exercises');
const seedUserCycle = require('./seed-user-cycle');

async function setupDemo() {
  console.log('🚀 Configuration de la démonstration FitMe - Gestion de cycle hormonal\n');
  
  try {
    console.log('📝 Étape 1/2 : Création des exercices et associations avec les phases de cycle');
    await seedExercises();
    
    console.log('\n👤 Étape 2/2 : Création d\'un utilisateur de test avec cycle actuel');
    await seedUserCycle();
    
    console.log('\n✨ CONFIGURATION TERMINÉE !\n');
    console.log('🎯 SYSTÈME CRÉÉ AVEC SUCCÈS :');
    console.log('─'.repeat(60));
    console.log('✅ Module Cycle : Gestion des phases menstruelles');
    console.log('✅ Module Exercise : 14 exercices adaptés par phase');
    console.log('✅ Module Program : Génération de programmes personnalisés');
    console.log('✅ Utilisateur de test : test@fitme.fr / testpassword123');
    console.log('✅ Cycle actuel : Phase Folliculaire (jour 12/28)');
    
    console.log('\n🔗 ENDPOINTS DISPONIBLES :');
    console.log('─'.repeat(60));
    console.log('🔐 POST /auth/login - Connexion utilisateur');
    console.log('📊 GET /cycle/current-phase - Phase actuelle du cycle');
    console.log('🏃‍♀️ GET /exercises?phase=FOLLICULAR - Exercices par phase');
    console.log('📋 POST /programs/generate - Génération de programme');
    
    console.log('\n💡 FONCTIONNALITÉS IMPLÉMENTÉES :');
    console.log('─'.repeat(60));
    console.log('• Calcul automatique de la phase de cycle');
    console.log('• Recommandations d\'exercices selon la phase');
    console.log('• Adaptation de l\'intensité par phase');
    console.log('• Génération de programmes complets');
    console.log('• Mapping phase → types d\'exercices');
    console.log('• API REST complète avec Swagger');
    
    console.log('\n🎮 EXEMPLE D\'UTILISATION :');
    console.log('─'.repeat(60));
    console.log('1. Connectez-vous : POST /auth/login');
    console.log('   { "email": "test@fitme.fr", "password": "testpassword123" }');
    console.log('2. Récupérez la phase : GET /cycle/current-phase');
    console.log('3. Exercices adaptés : GET /exercises?phase=FOLLICULAR');
    console.log('4. Programme 30min : POST /programs/generate { "duration": 30 }');
    
    console.log('\n📚 DOCUMENTATION :');
    console.log('─'.repeat(60));
    console.log('• API Swagger : http://localhost:3000/api-docs');
    console.log('• Architecture Clean + DDD respectée');
    console.log('• Séparation des domaines (Cycle, Exercise, Program)');
    
  } catch (error) {
    console.error('\n💥 ERREUR LORS DE LA CONFIGURATION :', error);
    console.log('\n🔧 VÉRIFICATIONS :');
    console.log('• Base de données PostgreSQL démarrée ?');
    console.log('• Migrations Prisma appliquées ? (npm run prisma:push)');
    console.log('• Variables d\'environnement configurées ?');
    process.exit(1);
  }
}

// Exécuter la configuration
if (require.main === module) {
  setupDemo();
}

module.exports = setupDemo; 