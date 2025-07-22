export interface Exercise {
    id:          number;
    title:       string;
    duration:    string;
    intensity:   'Très léger' | 'Léger' | 'Modéré' | 'Intense';
    phase:       string;
    category:    'Cardio' | 'Strength 💪' | 'Flexibility' | 'Recovery';
    description: string;
    muscles:     string[];
  }
  