const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const exercises = [
  // Phase MENSTRUAL - Exercices doux
  {
    title: 'Yoga doux - Étirements en douceur',
    description: 'Séance de yoga douce avec des postures relaxantes pour apaiser les tensions.',
    duration: 20,
    intensity: 'LOW',
    muscleZone: 'FLEXIBILITY',
    tags: ['MENSTRUAL_PHASE', 'RELAXATION', 'YOGA']
  },
  {
    title: 'Marche méditative',
    description: 'Marche lente et consciente pour maintenir l\'activité sans effort intense.',
    duration: 15,
    intensity: 'VERY_LOW',
    muscleZone: 'CARDIO',
    tags: ['MENSTRUAL_PHASE', 'MINDFULNESS', 'WALKING']
  },
  {
    title: 'Respiration profonde et relaxation',
    description: 'Exercices de respiration et techniques de relaxation.',
    duration: 10,
    intensity: 'VERY_LOW',
    muscleZone: 'CORE',
    tags: ['MENSTRUAL_PHASE', 'BREATHING', 'RELAXATION']
  },

  // Phase FOLLICULAR - Énergie croissante
  {
    title: 'Cardio léger - Vélo d\'appartement',
    description: 'Session de vélo à intensité modérée pour reprendre l\'activité.',
    duration: 25,
    intensity: 'MODERATE',
    muscleZone: 'CARDIO',
    tags: ['FOLLICULAR_PHASE', 'CARDIO', 'CYCLING']
  },
  {
    title: 'Renforcement bas du corps - Squats',
    description: 'Exercices de squats au poids du corps pour renforcer les jambes.',
    duration: 15,
    intensity: 'MODERATE',
    muscleZone: 'LOWER_BODY',
    tags: ['FOLLICULAR_PHASE', 'STRENGTH', 'BODYWEIGHT']
  },
  {
    title: 'Pilates - Core et stabilité',
    description: 'Exercices de Pilates pour renforcer le centre et améliorer la posture.',
    duration: 20,
    intensity: 'LOW',
    muscleZone: 'CORE',
    tags: ['FOLLICULAR_PHASE', 'CORE', 'PILATES']
  },

  // Phase OVULATION - Haute intensité
  {
    title: 'HIIT - Entraînement haute intensité',
    description: 'Circuit HIIT combinant cardio et renforcement pour un maximum d\'efficacité.',
    duration: 30,
    intensity: 'HIGH',
    muscleZone: 'FULL_BODY',
    tags: ['OVULATION_PHASE', 'HIIT', 'HIGH_INTENSITY']
  },
  {
    title: 'Musculation - Haut du corps',
    description: 'Entraînement intensif pour les bras, épaules et dos avec charges.',
    duration: 35,
    intensity: 'HIGH',
    muscleZone: 'UPPER_BODY',
    tags: ['OVULATION_PHASE', 'STRENGTH', 'WEIGHT_TRAINING']
  },
  {
    title: 'Course à pied - Tempo',
    description: 'Course à rythme soutenu pour travailler l\'endurance cardiovasculaire.',
    duration: 40,
    intensity: 'VERY_HIGH',
    muscleZone: 'CARDIO',
    tags: ['OVULATION_PHASE', 'CARDIO', 'RUNNING']
  },

  // Phase LUTEAL - Modéré avec focus technique
  {
    title: 'Musculation - Technique et contrôle',
    description: 'Entraînement de musculation avec focus sur la technique et le contrôle.',
    duration: 30,
    intensity: 'MODERATE',
    muscleZone: 'FULL_BODY',
    tags: ['LUTEAL_PHASE', 'STRENGTH', 'TECHNIQUE']
  },
  {
    title: 'Yoga Power - Force et équilibre',
    description: 'Yoga dynamique alliant force, équilibre et concentration.',
    duration: 25,
    intensity: 'MODERATE',
    muscleZone: 'BALANCE',
    tags: ['LUTEAL_PHASE', 'YOGA', 'BALANCE']
  },
  {
    title: 'Natation - Endurance douce',
    description: 'Session de natation pour travailler l\'endurance en douceur.',
    duration: 35,
    intensity: 'MODERATE',
    muscleZone: 'CARDIO',
    tags: ['LUTEAL_PHASE', 'CARDIO', 'SWIMMING']
  },

  // Exercices généraux (toutes phases)
  {
    title: 'Étirements complets',
    description: 'Routine d\'étirements pour tout le corps, adaptable à toute phase.',
    duration: 15,
    intensity: 'LOW',
    muscleZone: 'FLEXIBILITY',
    tags: ['ALL_PHASES', 'STRETCHING', 'FLEXIBILITY']
  },
  {
    title: 'Méditation et mindfulness',
    description: 'Session de méditation pour réduire le stress et améliorer la concentration.',
    duration: 10,
    intensity: 'VERY_LOW',
    muscleZone: 'CORE',
    tags: ['ALL_PHASES', 'MEDITATION', 'MINDFULNESS']
  },
  // Additions (public, evidence-aligned)
  {
    title: 'Étirements lombaires en douceur',
    description: 'Mobilisation douce du bas du dos pour réduire les tensions pendant les règles.',
    duration: 12,
    intensity: 'LOW',
    muscleZone: 'FLEXIBILITY',
    tags: ['MENSTRUAL_PHASE', 'RELAXATION', 'STRETCHING']
  },
  {
    title: 'Marche rapide - relance cardio',
    description: 'Marche active pour relancer progressivement l’endurance en phase folliculaire.',
    duration: 20,
    intensity: 'MODERATE',
    muscleZone: 'CARDIO',
    tags: ['FOLLICULAR_PHASE', 'CARDIO', 'WALKING']
  },
  {
    title: 'Plyométrie légère (sauts contrôlés)',
    description: 'Rebonds et sauts contrôlés, profitant du pic de forme autour de l’ovulation.',
    duration: 15,
    intensity: 'HIGH',
    muscleZone: 'FULL_BODY',
    tags: ['OVULATION_PHASE', 'HIIT', 'HIGH_INTENSITY']
  },
  {
    title: 'Marche inclinée (tapis)',
    description: 'Cardio modéré et stable, bon compromis en phase lutéale.',
    duration: 25,
    intensity: 'MODERATE',
    muscleZone: 'CARDIO',
    tags: ['LUTEAL_PHASE', 'CARDIO', 'WALKING']
  },
  {
    title: 'Respiration diaphragmatique',
    description: 'Contrôle respiratoire pour la récupération et la gestion du stress.',
    duration: 8,
    intensity: 'VERY_LOW',
    muscleZone: 'CORE',
    tags: ['ALL_PHASES', 'BREATHING', 'RELAXATION']
  }
];

async function seedExercises() {
  console.log('🌱 Début du peuplement des exercices...');

  try {
    // Nettoyer les données existantes
    await prisma.exerciseTag.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.exercise.deleteMany({});
    
    console.log('✅ Données existantes supprimées');

    // Créer les tags uniques
    const allTags = [...new Set(exercises.flatMap(ex => ex.tags))];
    const tagMap = {};
    
    for (const tagName of allTags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: { type: getTagType(tagName) },
        create: { name: tagName, type: getTagType(tagName) }
      });
      tagMap[tagName] = tag.id;
      console.log(`✅ Tag prêt: ${tagName}`);
    }

    // Créer/mettre à jour les exercices
    for (const exerciseData of exercises) {
      const { tags, ...exerciseProps } = exerciseData;
      const existing = await prisma.exercise.findFirst({ where: { title: exerciseProps.title } });
      const exercise = existing
        ? await prisma.exercise.update({
            where: { id: existing.id },
            data: {
              description: exerciseProps.description,
              duration: exerciseProps.duration,
              intensity: exerciseProps.intensity,
              muscleZone: exerciseProps.muscleZone,
            }
          })
        : await prisma.exercise.create({
            data: {
              title: exerciseProps.title,
              description: exerciseProps.description,
              duration: exerciseProps.duration,
              intensity: exerciseProps.intensity,
              muscleZone: exerciseProps.muscleZone,
            }
          });
      console.log(`✅ Exercice prêt: ${exercise.title}`);
      // Réassigner les tags
      await prisma.exerciseTag.deleteMany({ where: { exerciseId: exercise.id } });
      for (const tagName of tags) {
        await prisma.exerciseTag.create({
          data: { exerciseId: exercise.id, tagId: tagMap[tagName] }
        });
      }
    }

    console.log(`🎉 ${exercises.length} exercices créés avec succès !`);
    console.log('\n📊 Résumé par phase:');
    
    // Statistiques par phase
    const phases = ['MENSTRUAL_PHASE', 'FOLLICULAR_PHASE', 'OVULATION_PHASE', 'LUTEAL_PHASE', 'ALL_PHASES'];
    for (const phase of phases) {
      const count = await prisma.exerciseTag.count({
        where: { 
          tag: { name: phase }
        }
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

function getTagType(tagName) {
  if (tagName.includes('_PHASE')) return 'OBJECTIVE';
  if (['RELAXATION', 'MINDFULNESS', 'BREATHING'].includes(tagName)) return 'STYLE';
  if (['YOGA', 'PILATES', 'HIIT', 'RUNNING', 'SWIMMING', 'CYCLING', 'WALKING'].includes(tagName)) return 'STYLE';
  if (['STRENGTH', 'CARDIO', 'CORE', 'BALANCE'].includes(tagName)) return 'OBJECTIVE';
  if (['BODYWEIGHT', 'WEIGHT_TRAINING'].includes(tagName)) return 'EQUIPMENT';
  if (['HIGH_INTENSITY', 'TECHNIQUE'].includes(tagName)) return 'DIFFICULTY';
  if (['STRETCHING', 'FLEXIBILITY'].includes(tagName)) return 'OBJECTIVE';
  if (['MEDITATION'].includes(tagName)) return 'STYLE';
  return 'OBJECTIVE'; // Default
}

// Exécuter le script
if (require.main === module) {
  seedExercises()
    .then(() => {
      console.log('\n🚀 Base de données peuplée ! Vous pouvez maintenant tester les API:');
      console.log('   GET /exercises?category=FOLLICULAR_PHASE');
      console.log('   GET /cycle/current-phase');
      console.log('   POST /programs/generate');
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = seedExercises; 