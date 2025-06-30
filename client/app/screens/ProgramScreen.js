import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

const ProgramScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('mes-programmes');

  const myPrograms = [
    {
      id: 1,
      title: 'Programme Folliculaire',
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

  const recommendedPrograms = [
    {
      id: 4,
      title: 'Débutant Complet',
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Très léger': return 'bg-primary-200 text-primary-800';
      case 'Léger': return 'bg-success text-white';
      case 'Modéré': return 'bg-warning text-white';
      case 'Intense': return 'bg-error text-white';
      default: return 'bg-text-tertiary text-white';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-border';
    if (progress < 50) return 'bg-accent-400';
    if (progress < 80) return 'bg-primary-500';
    return 'bg-success';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-text-primary mb-2">Programmes</Text>
          <Text className="text-base text-text-secondary">
            Gérez vos entraînements personnalisés
          </Text>
        </View>

        {/* Tabs */}
        <View className="mb-6">
          <View className="flex-row bg-surface rounded-xl p-1 border border-border">
            <TouchableOpacity
              onPress={() => setActiveTab('mes-programmes')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                activeTab === 'mes-programmes' ? 'bg-primary-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'mes-programmes' ? 'text-white' : 'text-text-secondary'
              }`}>
                Mes Programmes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('recommandes')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                activeTab === 'recommandes' ? 'bg-primary-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'recommandes' ? 'text-white' : 'text-text-secondary'
              }`}>
                Recommandés
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Program Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateProgram')}
          className="bg-primary-500 rounded-xl p-4 mb-6 flex-row items-center justify-center"
        >
          <Text className="text-white text-xl mr-2">+</Text>
          <Text className="text-white font-bold text-lg">Créer un nouveau programme</Text>
        </TouchableOpacity>

        {/* Programs List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-4">
            {activeTab === 'mes-programmes' ? 'Vos programmes actifs' : 'Programmes recommandés'}
          </Text>
          
          {currentPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              className="bg-surface border border-border rounded-xl p-4 mb-4"
            >
              {/* Program Header */}
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-text-primary mb-1">
                    {program.title}
                  </Text>
                  <Text className="text-sm text-text-secondary mb-2">
                    {program.description}
                  </Text>
                </View>
                <View className={`w-4 h-4 rounded-full ${program.color}`} />
              </View>

              {/* Program Stats */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <View className="flex-1 mr-4">
                    <Text className="text-xs text-text-tertiary">Durée</Text>
                    <Text className="text-sm font-medium text-text-primary">{program.duration}</Text>
                  </View>
                  <View className="flex-1 mr-4">
                    <Text className="text-xs text-text-tertiary">Séances/sem</Text>
                    <Text className="text-sm font-medium text-text-primary">{program.workouts}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-text-tertiary">Dernière fois</Text>
                    <Text className="text-sm font-medium text-text-primary" numberOfLines={1} ellipsizeMode="tail">{program.lastWorkout}</Text>
                  </View>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium text-text-primary">Progression</Text>
                  <Text className="text-sm text-text-secondary">{program.progress}%</Text>
                </View>
                <View className="bg-border h-2 rounded-full">
                  <View 
                    className={`h-2 rounded-full ${getProgressColor(program.progress)}`}
                    style={{ width: `${program.progress}%` }}
                  />
                </View>
              </View>

              {/* Tags and Action */}
              <View className="flex-row items-center">
                <View className="flex-1 mr-3">
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    className="flex-row"
                    contentContainerStyle={{ paddingRight: 8 }}
                  >
                    <View className="flex-row space-x-2">
                      <View className={`px-3 py-1 rounded-full ${getDifficultyColor(program.difficulty)}`}>
                        <Text className="text-xs font-medium">{program.difficulty}</Text>
                      </View>
                      <View className="px-3 py-1 rounded-full bg-primary-400">
                        <Text className="text-xs font-medium text-white">{program.phase}</Text>
                      </View>
                      {program.workouts <= 2 && (
                        <View className="px-3 py-1 rounded-full bg-success">
                          <Text className="text-xs font-medium text-white">Débutant</Text>
                        </View>
                      )}
                      {program.duration.includes('8') && (
                        <View className="px-3 py-1 rounded-full bg-accent-500">
                          <Text className="text-xs font-medium text-white">Longue durée</Text>
                        </View>
                      )}
                      {program.workouts >= 4 && (
                        <View className="px-3 py-1 rounded-full bg-warning">
                          <Text className="text-xs font-medium text-white">Intensif</Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                </View>
                
                <TouchableOpacity className="bg-primary-500 px-4 py-2 rounded-lg">
                  <Text className="text-white font-medium text-sm">
                    {program.progress === 0 ? 'Commencer' : 'Continuer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        <View className="bg-surface border border-border rounded-xl p-4 mb-8">
          <Text className="text-lg font-semibold text-text-primary mb-4">Vos statistiques</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-600">3</Text>
              <Text className="text-sm text-text-secondary">Programmes</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-accent-600">12</Text>
              <Text className="text-sm text-text-secondary">Séances total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-success">7</Text>
              <Text className="text-sm text-text-secondary">Jours streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgramScreen; 
