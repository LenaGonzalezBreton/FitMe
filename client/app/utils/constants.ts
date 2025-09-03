// Exercise Intensity Options (matching API interface)
export const INTENSITY_OPTIONS = [
  { value: 'VERY_LOW', label: 'Très faible' },
  { value: 'LOW', label: 'Faible' },
  { value: 'MODERATE', label: 'Modérée' },
  { value: 'HIGH', label: 'Élevée' },
  { value: 'VERY_HIGH', label: 'Très élevée' }
];

// Exercise Muscle Zone Options
export const MUSCLE_ZONE_OPTIONS = [
  { value: 'UPPER_BODY', label: 'Haut du corps' },
  { value: 'LOWER_BODY', label: 'Bas du corps' },
  { value: 'CORE', label: 'Centre' },
  { value: 'FULL_BODY', label: 'Corps entier' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'FLEXIBILITY', label: 'Flexibilité' },
  { value: 'BALANCE', label: 'Équilibre' }
];

// Exercise Category Options (based on backend tags)
export const EXERCISE_CATEGORY_OPTIONS = [
  { value: 'STRENGTH', label: 'Force' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'CORE', label: 'Centre' },
  { value: 'BALANCE', label: 'Équilibre' },
  { value: 'FLEXIBILITY', label: 'Flexibilité' },
  { value: 'YOGA', label: 'Yoga' },
  { value: 'PILATES', label: 'Pilates' },
  { value: 'HIIT', label: 'HIIT' },
  { value: 'RUNNING', label: 'Course' },
  { value: 'WALKING', label: 'Marche' },
  { value: 'CYCLING', label: 'Vélo' },
  { value: 'SWIMMING', label: 'Natation' },
  { value: 'BODYWEIGHT', label: 'Poids du corps' },
  { value: 'WEIGHT_TRAINING', label: 'Musculation' },
  { value: 'RELAXATION', label: 'Relaxation' },
  { value: 'MINDFULNESS', label: 'Pleine conscience' },
  { value: 'BREATHING', label: 'Respiration' },
  { value: 'MEDITATION', label: 'Méditation' }
];

// Helper functions
export const getIntensityLabel = (intensity?: string): string => {
  if (!intensity) return 'Non définie';
  const option = INTENSITY_OPTIONS.find(opt => opt.value === intensity);
  return option ? option.label : intensity;
};

export const getMuscleZoneLabel = (muscleZone?: string): string => {
  if (!muscleZone) return 'Non définie';
  const option = MUSCLE_ZONE_OPTIONS.find(opt => opt.value === muscleZone);
  return option ? option.label : muscleZone;
};

export const getCategoryLabel = (category?: string): string => {
  if (!category) return 'Non définie';
  const option = EXERCISE_CATEGORY_OPTIONS.find(opt => opt.value === category);
  return option ? option.label : category;
};

