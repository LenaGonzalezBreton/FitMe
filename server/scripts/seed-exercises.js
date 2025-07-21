const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const exercises = [
  // Phase MENSTRUAL - Exercices doux
  {
    title: 'Yoga doux - Étirements en douceur',
    description: 'Séance de yoga douce avec des postures relaxantes pour apaiser les tensions.',
    durationMinutes: 20,
    intensity: 'LOW',
    muscleZone: 'FLEXIBILITY',
    phases: ['MENSTRUAL']
  },
  {
    title: 'Marche méditative',
    description: 'Marche lente et consciente pour maintenir l\'activité sans effort intense.',
    durationMinutes: 15,
    intensity: 'VERY_LOW',
    muscleZone: 'CARDIO',
    phases: ['MENSTRUAL']
  },
  {
    title: 'Respiration profonde et relaxation',
    description: 'Exercices de respiration et techniques de relaxation.',
    durationMinutes: 10,
    intensity: 'VERY_LOW',
    muscleZone: 'CORE',
    phases: ['MENSTRUAL']
  },

  // Phase FOLLICULAR - Énergie croissante
  {
    title: 'Cardio léger - Vélo d\'appartement',
    description: 'Session de vélo à intensité modérée pour reprendre l\'activité.',
    durationMinutes: 25,
    intensity: 'MODERATE',
    muscleZone: 'CARDIO',
    phases: ['FOLLICULAR']
  },
  {
    title: 'Renforcement bas du corps - Squats',
    description: 'Exercices de squats au poids du corps pour renforcer les jambes.',
    durationMinutes: 15,
    intensity: 'MODERATE',
    muscleZone: 'LOWER_BODY',
    phases: ['FOLLICULAR']
  },
  {
    title: 'Pilates - Core et stabilité',
    description: 'Exercices de Pilates pour renforcer le centre et améliorer la posture.',
    durationMinutes: 20,
    intensity: 'LOW',
    muscleZone: 'CORE',
    phases: ['FOLLICULAR']
  },

  // Phase OVULATION - Haute intensité
  {
    title: 'HIIT - Entraînement haute intensité',
    description: 'Circuit HIIT combinant cardio et renforcement pour un maximum d\'efficacité.',
    durationMinutes: 30,
    intensity: 'HIGH',
    muscleZone: 'FULL_BODY',
    phases: ['OVULATION']
  },
  {
    title: 'Musculation - Haut du corps',
    description: 'Entraînement intensif pour les bras, épaules et dos avec charges.',
    durationMinutes: 35,
    intensity: 'HIGH',
    muscleZone: 'UPPER_BODY',
    phases: ['OVULATION']
  },
  {
    title: 'Course à pied - Tempo',
    description: 'Course à rythme soutenu pour travailler l\'endurance cardiovasculaire.',
    durationMinutes: 40,
    intensity: 'VERY_HIGH',
    muscleZone: 'CARDIO',
    phases: ['OVULATION']
  },

  // Phase LUTEAL - Modéré avec focus technique
  {
    title: 'Musculation - Technique et contrôle',
    description: 'Entraînement de musculation avec focus sur la technique et le contrôle.',
    durationMinutes: 30,
    intensity: 'MODERATE',
    muscleZone: 'FULL_BODY',
    phases: ['LUTEAL']
  },
  {
    title: 'Yoga Power - Force et équilibre',
    description: 'Yoga dynamique alliant force, équilibre et concentration.',
    durationMinutes: 25,
    intensity: 'MODERATE',
    muscleZone: 'BALANCE',
    phases: ['LUTEAL']
  },
  {
    title: 'Natation - Endurance douce',
    description: 'Session de natation pour travailler l\'endurance en douceur.',
    durationMinutes: 35,
    intensity: 'MODERATE',
    muscleZone: 'CARDIO',
    phases: ['LUTEAL']
  },

  // Exercices généraux (toutes phases)
  {
    title: 'Étirements complets',
    description: 'Routine d\'étirements pour tout le corps, adaptable à toute phase.',
    durationMinutes: 15,
    intensity: 'LOW',
    muscleZone: 'FLEXIBILITY',
    phases: ['MENSTRUAL', 'FOLLICULAR', 'OVULATION', 'LUTEAL']
  },
  {
    title: 'Méditation et mindfulness',
    description: 'Session de méditation pour réduire le stress et améliorer la concentration.',
    durationMinutes: 10,
    intensity: 'VERY_LOW',
    muscleZone: 'CORE',
    phases: ['MENSTRUAL', 'FOLLICULAR', 'OVULATION', 'LUTEAL']
  }
];

async function seedExercises() {
  console.log('🌱 Début du peuplement des exercices...');

  try {
    // Nettoyer les données existantes
    await prisma.phaseExercise.deleteMany({});
    await prisma.exercise.deleteMany({});
    
    console.log('✅ Données existantes supprimées');

    // Créer les exercices
    for (const exerciseData of exercises) {
      const { phases, ...exerciseProps } = exerciseData;
      
      // Créer l'exercice
      const exercise = await prisma.exercise.create({
        data: exerciseProps
      });
      
      console.log(`✅ Exercice créé: ${exercise.title}`);
      
      // Associer l'exercice aux phases
      for (const phaseName of phases) {
        await prisma.phaseExercise.create({
          data: {
            phaseName,
            exerciseId: exercise.id
          }
        });
        console.log(`   → Associé à la phase ${phaseName}`);
      }
    }

    console.log(`🎉 ${exercises.length} exercices créés avec succès !`);
    console.log('\n📊 Résumé par phase:');
    
    // Statistiques par phase
    const phases = ['MENSTRUAL', 'FOLLICULAR', 'OVULATION', 'LUTEAL'];
    for (const phase of phases) {
      const count = await prisma.phaseExercise.count({
        where: { phaseName: phase }
      });
      console.log(`   ${phase}: ${count} exercices`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  seedExercises()
    .then(() => {
      console.log('\n🚀 Base de données peuplée ! Vous pouvez maintenant tester les API:');
      console.log('   GET /exercises?phase=FOLLICULAR');
      console.log('   GET /cycle/current-phase');
      console.log('   POST /programs/generate');
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = seedExercises; 