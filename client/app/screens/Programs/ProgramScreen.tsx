import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Tag from '../../components/Tag';
import ProgramExercisesList from '../../components/ProgramExercisesList';
import { NavigationProp } from '@react-navigation/native';
import { usePrograms } from '../../hooks/usePrograms';

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



  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPrograms();
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
      case 'Très léger': return 'bg-primary-100 text-primary-700';
      case 'Léger': return 'bg-success-100 text-success-700';
      case 'Modéré': return 'bg-warning-100 text-warning-700';
      case 'Intense': return 'bg-error-100 text-error-700';
      default: return 'bg-secondary-100 text-secondary-700';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress === 0) return 'bg-border';
    if (progress < 50) return 'bg-warning-500';
    if (progress < 80) return 'bg-primary-500';
    return 'bg-success-500';
  };

  // Loading state
  if (programsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#A99985" />
          <Text className="text-secondary-600 mt-4">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView 
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-brand-text mb-2">Programmes</Text>
          <Text className="text-base text-secondary-600">
            Gérez vos entraînements personnalisés
          </Text>
        </View>



        {/* Tabs */}
        <View className="mb-6">
          <View className="flex-row bg-surface rounded-xl p-1 shadow-sm border border-border-light">
            <TouchableOpacity
              onPress={() => setActiveTab('mes-programmes')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                activeTab === 'mes-programmes' ? 'bg-primary-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                activeTab === 'mes-programmes' ? 'text-surface' : 'text-secondary-600'
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
                activeTab === 'recommandes' ? 'text-surface' : 'text-secondary-600'
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
            className="bg-primary-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm active:bg-primary-600"
            disabled={programsLoading}
          >
            <Text className="text-surface text-xl mr-2">✨</Text>
            <Text className="text-surface font-bold text-lg">Générer un programme adapté</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateProgram')}
            className="bg-secondary-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm active:bg-secondary-600"
          >
            <Text className="text-surface text-xl mr-2">+</Text>
            <Text className="text-surface font-bold text-lg">Créer un programme personnalisé</Text>
          </TouchableOpacity>
        </View>

        {/* Programs List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-4">
            Vos programmes ({total})
          </Text>
          
          {/* Error state */}
          {programsError && (
            <View className="bg-error-50 border border-error-200 rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-error-700 text-center">{programsError}</Text>
              <TouchableOpacity 
                onPress={refreshPrograms}
                className="mt-2 bg-error-100 py-2 px-4 rounded-lg active:bg-error-200"
              >
                <Text className="text-error-700 text-center font-medium">Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No programs fallback */}
          {!programsError && currentPrograms.length === 0 && (
            <View className="bg-surface rounded-xl p-6 items-center shadow-sm border border-border-light">
              <Text className="text-6xl mb-4">💪</Text>
              <Text className="text-xl font-bold text-brand-text mb-2 text-center">
                Aucun programme pour le moment
              </Text>
              <Text className="text-secondary-600 text-center mb-4">
                Commencez votre parcours fitness en générant un programme adapté à votre cycle hormonal !
              </Text>
              <View className="bg-primary-50 rounded-lg p-3 mb-4 w-full">
                <Text className="text-primary-700 text-center font-medium">
                  Programme personnalisé disponible
                </Text>
                <Text className="text-primary-600 text-center text-sm">
                  Générez un programme adapté à vos objectifs
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleGenerateProgram}
                className="bg-primary-500 py-3 px-6 rounded-xl w-full active:bg-primary-600"
                disabled={programsLoading}
              >
                <Text className="text-surface font-bold text-center">
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
                className="bg-surface rounded-xl p-4 mb-4 shadow-sm border border-border-light active:bg-surface-secondary"
              >
                {/* Program Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="bg-primary-100 self-start px-3 py-1 rounded-full mb-2">
                      <Text className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                        {program.goal || 'Programme'}
                      </Text>
                    </View>
                    <Text className="text-xl font-bold text-brand-text mb-1">
                      {program.title}
                    </Text>
                    <Text className="text-sm text-secondary-600 mb-2">
                      {program.goal || 'Programme d\'entraînement personnalisé'}
                    </Text>
                  </View>
                  <View className={`w-4 h-4 rounded-full ${program.isActive ? 'bg-success-500' : 'bg-secondary-300'}`} />
                </View>

                {/* Program Stats */}
                <View className="mb-4">
                  <View className="flex-row justify-between mb-2">
                    <View className="flex-1 mr-4">
                      <Text className="text-xs text-secondary-600">Durée</Text>
                      <Text className="text-sm font-medium text-brand-text">
                        {formatDuration(program.startDate, program.endDate)}
                      </Text>
                    </View>
                    <View className="flex-1 mr-4">
                      <Text className="text-xs text-secondary-600">Exercices</Text>
                      <Text className="text-sm font-medium text-brand-text">{program.exerciseCount}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-secondary-600">Dernière fois</Text>
                      <Text className="text-sm font-medium text-brand-text" numberOfLines={1} ellipsizeMode="tail">
                        {getLastWorkout(program)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-medium text-brand-text">Progression</Text>
                    <Text className="text-sm text-secondary-600">{progress}%</Text>
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
                    {program.isActive && <Tag text="Actif" color="bg-success-500" textColor="text-surface" />}
                    {program.isTemplate && <Tag text="Modèle" color="bg-info-500" textColor="text-surface" />}
                    <Tag text={`${program.exerciseCount} exercices`} color="bg-primary-500" textColor="text-surface" />
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-2">
                  <TouchableOpacity 
                    className="flex-1 bg-primary-500 py-3 rounded-lg active:bg-primary-600"
                    onPress={() => {
                      if (!program.isActive) {
                        startProgram(program.id);
                      } else {
                        navigation.navigate('WorkoutSession');
                      }
                    }}
                  >
                    <Text className="text-surface font-bold text-center">
                      {program.isActive ? 'Continuer' : 'Démarrer'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="bg-secondary-200 py-3 px-4 rounded-lg active:bg-secondary-300"
                    onPress={() => {
                      setSelectedProgram(program);
                      setShowExercises(true);
                    }}
                  >
                    <Text className="text-secondary-700 font-medium">👀</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Stats */}
        {programs.length > 0 && (
          <View className="bg-surface rounded-xl p-4 mb-8 shadow-sm border border-border-light">
            <Text className="text-lg font-semibold text-brand-text mb-4">Vos statistiques</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary-500">{total}</Text>
                <Text className="text-sm text-secondary-600">Programme{total > 1 ? 's' : ''}</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-accent-500">
                  {programs.reduce((acc, program) => acc + program.exerciseCount, 0)}
                </Text>
                <Text className="text-sm text-secondary-600">Exercices total</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-success-500">
                  {programs.filter(p => p.isActive).length}
                </Text>
                <Text className="text-sm text-secondary-600">Actif{programs.filter(p => p.isActive).length > 1 ? 's' : ''}</Text>
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
