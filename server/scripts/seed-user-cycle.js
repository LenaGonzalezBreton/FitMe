const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedUserCycle() {
  console.log('🌱 Création d\'un utilisateur de test avec cycle...');

  try {
    // Créer un utilisateur de test
    const passwordHash = await bcrypt.hash('testpassword123', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'test@fitme.fr' },
      update: {},
      create: {
        email: 'test@fitme.fr',
        passwordHash,
        firstName: 'Marie',
        profileType: 'FEMALE',
        contextType: 'CYCLE',
      }
    });

    console.log(`✅ Utilisateur créé: ${user.email}`);

    // Créer la configuration de profil cycle
    const cycleConfig = await prisma.cycleProfileConfig.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        isCycleTrackingEnabled: true,
        usesExternalProvider: false,
        useMenopauseMode: false,
        averageCycleLength: 28,
        averagePeriodLength: 5,
        prefersManualInput: false,
      }
    });

    console.log('✅ Configuration de cycle créée');

    // Créer un cycle actuel (commencé il y a 12 jours - phase folliculaire)
    const cycleStartDate = new Date();
    cycleStartDate.setDate(cycleStartDate.getDate() - 12); // Il y a 12 jours

    const currentCycle = await prisma.cycle.create({
      data: {
        userId: user.id,
        startDate: cycleStartDate,
        cycleLength: 28,
        periodLength: 5,
        isRegular: true,
      }
    });

    console.log(`✅ Cycle actuel créé (jour ${12} - Phase Folliculaire)`);

    // Créer les phases du cycle
    const phases = [
      {
        name: 'MENSTRUAL',
        startDate: new Date(cycleStartDate),
        endDate: new Date(cycleStartDate.getTime() + 4 * 24 * 60 * 60 * 1000), // 5 jours
      },
      {
        name: 'FOLLICULAR',
        startDate: new Date(cycleStartDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(cycleStartDate.getTime() + 12 * 24 * 60 * 60 * 1000), // Jour 6-13
      },
      {
        name: 'OVULATION',
        startDate: new Date(cycleStartDate.getTime() + 13 * 24 * 60 * 60 * 1000),
        endDate: new Date(cycleStartDate.getTime() + 15 * 24 * 60 * 60 * 1000), // Jour 14-16
      },
      {
        name: 'LUTEAL',
        startDate: new Date(cycleStartDate.getTime() + 16 * 24 * 60 * 60 * 1000),
        endDate: new Date(cycleStartDate.getTime() + 27 * 24 * 60 * 60 * 1000), // Jour 17-28
      },
    ];

    for (const phase of phases) {
      await prisma.phase.create({
        data: {
          cycleId: currentCycle.id,
          name: phase.name,
          startDate: phase.startDate,
          endDate: phase.endDate,
        }
      });
      console.log(`   ✅ Phase ${phase.name} créée`);
    }

    console.log('\n🎉 Utilisateur de test créé avec succès !');
    console.log('\n📋 Informations de connexion:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Mot de passe: testpassword123`);
    console.log(`   Phase actuelle: FOLLICULAR (jour 12/28)`);
    
    console.log('\n🧪 Pour tester l\'API:');
    console.log('1. Connectez-vous avec POST /auth/login');
    console.log('2. Récupérez la phase actuelle avec GET /cycle/current-phase');
    console.log('3. Obtenez des exercices avec GET /exercises?phase=FOLLICULAR');
    console.log('4. Générez un programme avec POST /programs/generate');

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  seedUserCycle()
    .then(() => {
      console.log('\n🚀 Prêt pour les tests !');
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = seedUserCycle; 