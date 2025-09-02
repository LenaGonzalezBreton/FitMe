export interface Program {
    id:          number;
    title:       string;
    objective:   string;
    description: string;
    duration:    string;
    workouts:    number;
    difficulty:  'Très léger' | 'Léger' | 'Modéré' | 'Intense';
    phase:       string;
    color:       string;
    progress:    number;
    lastWorkout: string;
  }
  