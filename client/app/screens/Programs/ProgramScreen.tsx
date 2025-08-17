import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Tag from '../../components/Tag';
import ProgramExercisesList from '../../components/ProgramExercisesList';
import { NavigationProp } from '@react-navigation/native';
import { usePrograms } from '../../hooks/usePrograms';
import { useCycle } from '../../hooks/useCycle';
import { Program, ProgramExercise } from '../../types';

interface ProgramScreenProps {
  navigation: NavigationProp<any, any>;
}

const ProgramScreen = ({ navigation }: ProgramScreenProps) => {
  const [activeTab, setActiveTab] = useState('mes-programmes');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showExercises, setShowExercises] = useState(false);
  
  // Use hooks
  const { 
    programs, 
    activeProgram, 
    loading: programsLoading, 
    error: programsError,
    total,
    refreshPrograms,
    generateProgram,
    startProgram,
    deleteProgram 
  } = usePrograms({
    autoFetch: true
  });

  const {
    currentPhase,
    loading: phaseLoading,
    error: phaseError,
    refreshPhase,
    getPhaseLabel,
    getPhaseEmoji,
    getPhaseColor
  } = useCycle();

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshPrograms(), refreshPhase()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle program generation
  const handleGenerateProgram = async () => {
    const response = await generateProgram({
      duration: 30,
      sessionType: 'mixed'
    });
    
    if (response) {
      Alert.alert(
        'Programme généré !',
        `${response.message}\n\nVoulez-vous commencer ce programme maintenant ?`,
        [
          { text: 'Plus tard', style: 'cancel' },
          { 
            text: 'Commencer', 
            onPress: () => {
              // The program should be in the list now, find the most recent one
              if (programs.length > 0) {
                const latestProgram = programs[0]; // Assuming API returns newest first
                startProgram(latestProgram.id);
              }
            }
          }
        ]
      );
    }
  };

  // Helper functions
  const formatDuration = (startDate: string, endDate?: string): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (end) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(diffDays / 7);
      return weeks > 0 ? `${weeks} semaine${weeks > 1 ? 's' : ''}` : `${diffDays} jours`;
    }
    return 'Durée indéterminée';
  };

  const getLastWorkout = (program: Program): string => {
    // Calculate time since creation or last update
    const updatedDate = new Date(program.updatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  };

  const calculateProgress = (program: Program): number => {
    if (!program.startDate || !program.endDate) return 0;
    
    const start = new Date(program.startDate);
    const end = new Date(program.endDate);
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;
    
    return Math.round((elapsed / totalDuration) * 100);
  };

  // Get current programs based on active tab
  const currentPrograms = activeTab === 'mes-programmes' ? programs : [];

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

  // Loading state
  if (programsLoading || phaseLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-cream">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A99985" />
          <Text className="text-brand-dark-surface mt-4">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-brand-dark-bg mb-2">Programmes</Text>
          <Text className="text-base text-brand-dark-surface">
            Gérez vos entraînements personnalisés
          </Text>
        </View>

        {/* Current Phase Card */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-3">Phase actuelle</Text>
          {currentPhase ? (
            <View className="bg-white rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-dark-bg mb-1">
                    {getPhaseLabel(currentPhase.phase)}
                  </Text>
                  <Text className="text-sm text-brand-dark-surface mb-2">
                    Jour {currentPhase.cycleDay} de votre cycle
                  </Text>
                  <Text className="text-sm text-brand-dark-surface">
                    {currentPhase.phaseDescription}
                  </Text>
                </View>
                <View className={`${getPhaseColor(currentPhase.phase)} rounded-full w-12 h-12 items-center justify-center`}>
                  <Text className="text-brand-dark-bg text-xl">{getPhaseEmoji(currentPhase.phase)}</Text>
                </View>
              </View>
              {currentPhase.recommendations.length > 0 && (
                <View>
                  <Text className="text-sm font-semibold text-brand-dark-bg mb-2">Recommandations :</Text>
                  {currentPhase.recommendations.slice(0, 2).map((rec, index) => (
                    <Text key={index} className="text-xs text-brand-dark-surface mb-1">• {rec}</Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-brand-dark-bg mb-1">
                    Suivi du cycle non configuré
                  </Text>
                  <Text className="text-sm text-brand-dark-surface mb-2">
                    {phaseError || 'Configurez votre suivi de cycle pour des programmes personnalisés'}
                  </Text>
                </View>
                <View className="bg-gray-100 rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-gray-400 text-xl">🌙</Text>
                </View>
              </View>
              <TouchableOpacity 
                className="bg-primary-50 p-3 rounded-lg"
                onPress={() => {
                  Alert.alert(
                    'Configuration du cycle',
                    'Pour bénéficier de programmes personnalisés selon votre cycle hormonal, configurez le suivi de votre cycle dans les paramètres.',
                    [
                      { text: 'Plus tard', style: 'cancel' },
                      { text: 'Configurer', onPress: () => console.log('Navigate to cycle settings') }
                    ]
                  );
                }}
              >
                <Text className="text-primary-700 text-center font-medium">
                  Configurer le suivi du cycle
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

        {/* Action Buttons */}
        <View className="mb-6 space-y-3">
          <TouchableOpacity
            onPress={handleGenerateProgram}
            className="bg-primary-500 rounded-xl p-4 flex-row items-center justify-center"
            disabled={programsLoading}
          >
            <Text className="text-white text-xl mr-2">✨</Text>
            <Text className="text-white font-bold text-lg">Générer un programme adapté</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateProgram')}
            className="bg-brand-brown rounded-xl p-4 flex-row items-center justify-center"
          >
            <Text className="text-white text-xl mr-2">+</Text>
            <Text className="text-white font-bold text-lg">Créer un programme personnalisé</Text>
          </TouchableOpacity>
        </View>

        {/* Programs List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-4">
            Vos programmes ({total})
          </Text>
          
          {/* Error state */}
          {programsError && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-800 text-center">{programsError}</Text>
              <TouchableOpacity 
                onPress={refreshPrograms}
                className="mt-2 bg-red-100 py-2 px-4 rounded-lg"
              >
                <Text className="text-red-800 text-center font-medium">Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No programs fallback */}
          {!programsError && currentPrograms.length === 0 && (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-6xl mb-4">💪</Text>
              <Text className="text-xl font-bold text-brand-dark-bg mb-2 text-center">
                Aucun programme pour le moment
              </Text>
              <Text className="text-brand-dark-surface text-center mb-4">
                Commencez votre parcours fitness en générant un programme adapté à votre cycle hormonal !
              </Text>
              {currentPhase ? (
                <View className="bg-primary-50 rounded-lg p-3 mb-4 w-full">
                  <Text className="text-primary-700 text-center font-medium">
                    Phase {getPhaseLabel(currentPhase.phase)} détectée
                  </Text>
                  <Text className="text-primary-600 text-center text-sm">
                    Idéal pour un programme {currentPhase.phase === 'FOLLICULAR' ? 'de renforcement' : 
                                              currentPhase.phase === 'OVULATION' ? 'intensif' :
                                              currentPhase.phase === 'LUTEAL' ? 'modéré' : 'doux'}
                  </Text>
                </View>
              ) : (
                <View className="bg-gray-50 rounded-lg p-3 mb-4 w-full">
                  <Text className="text-gray-700 text-center font-medium">
                    Programme générique disponible
                  </Text>
                  <Text className="text-gray-600 text-center text-sm">
                    Un programme adapté sera généré selon vos préférences
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={handleGenerateProgram}
                className="bg-primary-500 py-3 px-6 rounded-xl w-full"
                disabled={programsLoading}
              >
                <Text className="text-white font-bold text-center">
                  {programsLoading ? 'Génération...' : 'Générer mon premier programme'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Programs list */}
          {currentPrograms.map((program: Program) => {
            const progress = calculateProgress(program);
            return (
              <TouchableOpacity
                key={program.id}
                className="bg-white rounded-xl p-4 mb-4"
              >
                {/* Program Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="bg-primary-100 self-start px-3 py-1 rounded-full mb-2">
                      <Text className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                        {program.goal || 'Programme'}
                      </Text>
                    </View>
                    <Text className="text-xl font-bold text-brand-dark-bg mb-1">
                      {program.title}
                    </Text>
                    <Text className="text-sm text-brand-dark-surface mb-2">
                      {program.goal || 'Programme d\'entraînement personnalisé'}
                    </Text>
                  </View>
                  <View className={`w-4 h-4 rounded-full ${program.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </View>

                {/* Program Stats */}
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <View className="flex-1 mr-4">
                      <Text className="text-xs text-brand-dark-surface">Durée</Text>
                      <Text className="text-sm font-medium text-brand-dark-bg">
                        {formatDuration(program.startDate, program.endDate)}
                      </Text>
                    </View>
                    <View className="flex-1 mr-4">
                      <Text className="text-xs text-brand-dark-surface">Exercices</Text>
                      <Text className="text-sm font-medium text-brand-dark-bg">{program.exerciseCount}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-brand-dark-surface">Dernière fois</Text>
                      <Text className="text-sm font-medium text-brand-dark-bg" numberOfLines={1} ellipsizeMode="tail">
                        {getLastWorkout(program)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-medium text-brand-dark-bg">Progression</Text>
                    <Text className="text-sm text-brand-dark-surface">{progress}%</Text>
                  </View>
                  <View className="bg-border h-2 rounded-full">
                    <View 
                      className={`h-2 rounded-full ${getProgressColor(progress)}`}
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </View>

                {/* Tags and Actions */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row space-x-2">
                    {program.isActive && <Tag text="Actif" color="bg-green-500" textColor="text-white" />}
                    {program.isTemplate && <Tag text="Modèle" color="bg-blue-500" textColor="text-white" />}
                    <Tag text={`${program.exerciseCount} exercices`} color="bg-primary-400" textColor="text-white" />
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                  <TouchableOpacity 
                    className="flex-1 bg-brand-brown py-3 rounded-lg"
                    onPress={() => {
                      if (!program.isActive) {
                        startProgram(program.id);
                      } else {
                        navigation.navigate('WorkoutSession');
                      }
                    }}
                  >
                    <Text className="text-white font-bold text-center">
                      {program.isActive ? 'Continuer' : 'Démarrer'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="bg-gray-200 py-3 px-4 rounded-lg"
                    onPress={() => {
                      setSelectedProgram(program);
                      setShowExercises(true);
                    }}
                  >
                    <Text className="text-brand-dark-bg font-medium">👀</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Stats */}
        {programs.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-8">
            <Text className="text-lg font-semibold text-brand-dark-bg mb-4">Vos statistiques</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary-400">{total}</Text>
                <Text className="text-sm text-brand-dark-surface">Programme{total > 1 ? 's' : ''}</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-accent-400">
                  {programs.reduce((acc, program) => acc + program.exerciseCount, 0)}
                </Text>
                <Text className="text-sm text-brand-dark-surface">Exercices total</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-success">
                  {programs.filter(p => p.isActive).length}
                </Text>
                <Text className="text-sm text-brand-dark-surface">Actif{programs.filter(p => p.isActive).length > 1 ? 's' : ''}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Program Exercises Modal */}
        {selectedProgram && (
          <ProgramExercisesList
            exercises={selectedProgram.exercises || []}
            visible={showExercises}
            onClose={() => {
              setShowExercises(false);
              setSelectedProgram(null);
            }}
            programTitle={selectedProgram.title}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgramScreen; 
