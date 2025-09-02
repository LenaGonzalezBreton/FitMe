const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const programs = [
  // Program for MENSTRUAL phase - Gentle and restorative
  {
    title: 'Programme Douceur - Phase Menstruelle',
    goal: 'Maintenir l\'activité en douceur et favoriser la récupération',
    isTemplate: true,
    exercises: [
      {
        title: 'Yoga doux - Étirements en douceur',
        order: 1,
        sets: 1,
        duration: 1200, // 20 minutes
        restTime: 0,
        notes: 'Postures douces et relaxantes'
      },
      {
        title: 'Marche méditative',
        order: 2,
        sets: 1,
        duration: 900, // 15 minutes
        restTime: 0,
        notes: 'Marche lente et consciente'
      },
      {
        title: 'Respiration profonde et relaxation',
        order: 3,
        sets: 1,
        duration: 600, // 10 minutes
        restTime: 0,
        notes: 'Techniques de respiration'
      }
    ]
  },

  // Program for FOLLICULAR phase - Building energy
  {
    title: 'Programme Énergie - Phase Folliculaire',
    goal: 'Reprendre l\'activité et construire l\'endurance',
    isTemplate: true,
    exercises: [
      {
        title: 'Cardio léger - Vélo d\'appartement',
        order: 1,
        sets: 1,
        duration: 1500, // 25 minutes
        restTime: 0,
        notes: 'Intensité modérée'
      },
      {
        title: 'Renforcement bas du corps - Squats',
        order: 2,
        sets: 3,
        reps: '10-12',
        restTime: 60,
        notes: 'Au poids du corps'
      },
      {
        title: 'Pilates - Core et stabilité',
        order: 3,
        sets: 1,
        duration: 1200, // 20 minutes
        restTime: 0,
        notes: 'Focus sur la stabilité'
      }
    ]
  },

  // Program for OVULATION phase - High intensity
  {
    title: 'Programme Performance - Phase d\'Ovulation',
    goal: 'Maximiser les performances et la force',
    isTemplate: true,
    exercises: [
      {
        title: 'HIIT - Entraînement haute intensité',
        order: 1,
        sets: 1,
        duration: 1800, // 30 minutes
        restTime: 0,
        notes: 'Circuit haute intensité'
      },
      {
        title: 'Musculation - Haut du corps',
        order: 2,
        sets: 4,
        reps: '8-10',
        restTime: 90,
        notes: 'Avec charges'
      },
      {
        title: 'Course à pied - Tempo',
        order: 3,
        sets: 1,
        duration: 2400, // 40 minutes
        restTime: 0,
        notes: 'Rythme soutenu'
      }
    ]
  },

  // Program for LUTEAL phase - Moderate with technique focus
  {
    title: 'Programme Technique - Phase Lutéale',
    goal: 'Affiner la technique et maintenir la forme',
    isTemplate: true,
    exercises: [
      {
        title: 'Musculation - Technique et contrôle',
        order: 1,
        sets: 3,
        reps: '12-15',
        restTime: 75,
        notes: 'Focus sur la technique'
      },
      {
        title: 'Yoga Power - Force et équilibre',
        order: 2,
        sets: 1,
        duration: 1500, // 25 minutes
        restTime: 0,
        notes: 'Yoga dynamique'
      },
      {
        title: 'Natation - Endurance douce',
        order: 3,
        sets: 1,
        duration: 2100, // 35 minutes
        restTime: 0,
        notes: 'Endurance modérée'
      }
    ]
  },

  // General fitness program
  {
    title: 'Programme Fitness Général',
    goal: 'Maintenir une forme physique équilibrée',
    isTemplate: true,
    exercises: [
      {
        title: 'Étirements complets',
        order: 1,
        sets: 1,
        duration: 900, // 15 minutes
        restTime: 0,
        notes: 'Routine complète'
      },
      {
        title: 'Cardio léger - Vélo d\'appartement',
        order: 2,
        sets: 1,
        duration: 1200, // 20 minutes
        restTime: 0,
        notes: 'Intensité modérée'
      },
      {
        title: 'Renforcement bas du corps - Squats',
        order: 3,
        sets: 3,
        reps: '10-12',
        restTime: 60,
        notes: 'Au poids du corps'
      },
      {
        title: 'Méditation et mindfulness',
        order: 4,
        sets: 1,
        duration: 600, // 10 minutes
        restTime: 0,
        notes: 'Relaxation finale'
      }
    ]
  }
];

async function seedPrograms() {
  console.log('🌱 Début du peuplement des programmes d\'entraînement...');

  try {
    // Nettoyer les données existantes
    await prisma.programExercise.deleteMany({});
    await prisma.program.deleteMany({
      where: { isTemplate: true }
    });
    
    console.log('✅ Données existantes supprimées');

    // Créer les programmes
    for (const programData of programs) {
      const { exercises, ...programProps } = programData;
      
      // Créer le programme
      const program = await prisma.program.create({
        data: {
          ...programProps,
          userId: 'system', // System-generated programs
          startDate: new Date(),
          isActive: false
        }
      });
      
      console.log(`✅ Programme créé: ${program.title}`);
      
      // Créer les exercices du programme
      for (const exerciseData of exercises) {
        // Trouver l'exercice par titre
        const exercise = await prisma.exercise.findFirst({
          where: { title: exerciseData.title }
        });
        
        if (exercise) {
          await prisma.programExercise.create({
            data: {
              programId: program.id,
              exerciseId: exercise.id,
              order: exerciseData.order,
              sets: exerciseData.sets,
              reps: exerciseData.reps,
              duration: exerciseData.duration,
              restTime: exerciseData.restTime,
              notes: exerciseData.notes
            }
          });
          console.log(`   → Exercice ajouté: ${exerciseData.title}`);
        } else {
          console.log(`   ⚠️ Exercice non trouvé: ${exerciseData.title}`);
        }
      }
    }

    console.log(`🎉 ${programs.length} programmes créés avec succès !`);

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  seedPrograms()
    .then(() => {
      console.log('\n🚀 Programmes d\'entraînement créés ! Vous pouvez maintenant tester les API:');
      console.log('   GET /programs?isTemplate=true');
      console.log('   POST /programs/generate');
      console.log('   POST /workouts/sessions');
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = seedPrograms;


