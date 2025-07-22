import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Tag from '../../components/Tag';
import { NavigationProp } from '@react-navigation/native';

interface Program {
  id: number;
  title: string;
  objective: string;
  description: string;
  duration: string;
  workouts: number;
  difficulty: 'Très léger' | 'Léger' | 'Modéré' | 'Intense';
  phase: string;
  color: string;
  progress: number;
  lastWorkout: string;
}

interface ProgramScreenProps {
  navigation: NavigationProp<any, any>;
}

const ProgramScreen = ({ navigation }: ProgramScreenProps) => {
  const [activeTab, setActiveTab] = useState('mes-programmes');

  const myPrograms: Program[] = [
  {
    id: 1,
    title: 'Programme Folliculaire',
    objective: 'Hypertrophie',
    description: 'Entraînement adapté à votre phase d\'énergie haute',
    duration: '4 semaines',
    workouts: 3,
    difficulty: 'Modéré',
    phase: 'Folliculaire',
    color: 'bg-primary-500',
    progress: 65,
    lastWorkout: '2 jours',
  },
  {
    id: 2,
    title: 'Récupération Douce',
    objective: 'Flexibilité',
    description: 'Programme de yoga et étirements pour les jours difficiles',
    duration: '2 semaines',
    workouts: 2,
    difficulty: 'Léger',
    phase: 'Menstruelle',
      color: 'bg-accent-500',
    progress: 30,
    lastWorkout: '1 semaine',
  },
  {
    id: 3,
    title: 'HIIT Intensif',
    objective: 'Perte de poids',
    description: 'Maximisez votre potentiel pendant l\'ovulation',
    duration: '3 semaines',
    workouts: 4,
    difficulty: 'Intense',
    phase: 'Ovulatoire',
      color: 'bg-error',
    progress: 0,
    lastWorkout: 'Pas encore commencé',
  },
];

  const recommendedPrograms: Program[] = [
    {
      id: 4,
      title: 'Débutant Complet',
      objective: 'Remise en forme',
      description: 'Programme parfait pour commencer en douceur',
      duration: '6 semaines',
      workouts: 2,
      difficulty: 'Léger',
      phase: 'Toutes phases',
      color: 'bg-success',
      progress: 0,
      lastWorkout: 'Nouveau',
    },
    {
      id: 5,
      title: 'Force & Endurance',
      objective: 'Force',
      description: 'Combinaison équilibrée de musculation et cardio',
      duration: '8 semaines',
      workouts: 4,
      difficulty: 'Modéré',
      phase: 'Folliculaire/Ovulatoire',
      color: 'bg-primary-600',
      progress: 0,
      lastWorkout: 'Nouveau',
    },
    {
      id: 6,
      title: 'Bien-être Menstruel',
      objective: 'Relaxation',
      description: 'Programme doux pour les jours difficiles',
      duration: '4 semaines',
      workouts: 2,
      difficulty: 'Très léger',
      phase: 'Menstruelle/Lutéale/Récupération',
      color: 'bg-primary-300',
      progress: 0,
      lastWorkout: 'Nouveau',
    },
  ];

  // Get current programs based on active tab
  const currentPrograms = activeTab === 'mes-programmes' ? myPrograms : recommendedPrograms;

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Très léger': return 'bg-primary-200 text-primary-800';
      case 'Léger': return 'bg-success text-white';
      case 'Modéré': return 'bg-warning text-white';
      case 'Intense': return 'bg-error text-white';
      default: return 'bg-text-tertiary text-white';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress === 0) return 'bg-border';
    if (progress < 50) return 'bg-accent-400';
    if (progress < 80) return 'bg-primary-500';
    return 'bg-success';
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-brand-dark-bg mb-2">Programmes</Text>
          <Text className="text-base text-brand-dark-surface">
            Gérez vos entraînements personnalisés
          </Text>
        </View>

        {/* Tabs */}
        <View className="mb-6">
          <View className="flex-row bg-white rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setActiveTab('mes-programmes')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                activeTab === 'mes-programmes' ? 'bg-brand-brown' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'mes-programmes' ? 'text-white' : 'text-brand-dark-surface'
              }`}>
                Mes Programmes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('recommandes')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                activeTab === 'recommandes' ? 'bg-brand-brown' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'recommandes' ? 'text-white' : 'text-brand-dark-surface'
              }`}>
                Recommandés
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Program Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateProgram')}
          className="bg-brand-brown rounded-xl p-4 mb-6 flex-row items-center justify-center"
        >
          <Text className="text-white text-xl mr-2">+</Text>
          <Text className="text-white font-bold text-lg">Créer un nouveau programme</Text>
        </TouchableOpacity>

        {/* Programs List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-4">
            {activeTab === 'mes-programmes' ? 'Vos programmes actifs' : 'Programmes recommandés'}
          </Text>
          
          {currentPrograms.map((program: Program) => (
            <TouchableOpacity
              key={program.id}
              className="bg-white rounded-xl p-4 mb-4"
            >
              {/* Program Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="bg-primary-100 self-start px-3 py-1 rounded-full mb-2">
                    <Text className="text-xs font-bold text-primary-700 uppercase tracking-wider">{program.objective}</Text>
                  </View>
                  <Text className="text-xl font-bold text-brand-dark-bg mb-1">
                    {program.title}
                  </Text>
                  <Text className="text-sm text-brand-dark-surface mb-2">
                    {program.description}
                  </Text>
                </View>
                <View className={`w-4 h-4 rounded-full ${program.color}`} />
              </View>

              {/* Program Stats */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <View className="flex-1 mr-4">
                    <Text className="text-xs text-brand-dark-surface">Durée</Text>
                    <Text className="text-sm font-medium text-brand-dark-bg">{program.duration}</Text>
                  </View>
                  <View className="flex-1 mr-4">
                    <Text className="text-xs text-brand-dark-surface">Séances/sem</Text>
                    <Text className="text-sm font-medium text-brand-dark-bg">{program.workouts}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-brand-dark-surface">Dernière fois</Text>
                    <Text className="text-sm font-medium text-brand-dark-bg" numberOfLines={1} ellipsizeMode="tail">{program.lastWorkout}</Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium text-brand-dark-bg">Progression</Text>
                  <Text className="text-sm text-brand-dark-surface">{program.progress}%</Text>
                </View>
                <View className="bg-border h-2 rounded-full">
                  <View 
                    className={`h-2 rounded-full ${getProgressColor(program.progress)}`}
                    style={{ width: `${program.progress}%` }}
                  />
                </View>
              </View>

              {/* Tags and Action */}
              <View className="flex-row items-center justify-between">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row"
                  contentContainerStyle={{ paddingVertical: 8, paddingRight: 16 }}
                >
                  <View className="flex-row space-x-2 items-center">
                    <Tag text={program.difficulty} color={getDifficultyColor(program.difficulty)} />
                    <Tag text={program.phase} color="bg-primary-400" />
                    {program.workouts <= 2 && (
                      <Tag text="Débutant" color="bg-success" />
                    )}
                    {program.duration.includes('8') && (
                      <Tag text="Longue durée" color="bg-accent-500" />
                    )}
                    {program.workouts >= 4 && (
                      <Tag text="Intensif" color="bg-warning" />
                    )}
                  </View>
                </ScrollView>
              </View>
              <TouchableOpacity className="bg-brand-brown px-4 py-3 rounded-lg mt-3">
                <Text className="text-white font-bold text-center">
                  {program.progress === 0 ? 'Commencer' : 'Continuer'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View className="bg-brand-cream rounded-xl p-4 mb-8">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-4">Vos statistiques</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-400">3</Text>
              <Text className="text-sm text-brand-dark-surface">Programmes</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-accent-400">12</Text>
              <Text className="text-sm text-brand-dark-surface">Séances total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-success">7</Text>
              <Text className="text-sm text-brand-dark-surface">Jours streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgramScreen; 
