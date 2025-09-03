import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import Tag from '../../components/Tag';
import ProgramExercisesList from '../../components/ProgramExercisesList';
import PresetProgramsModal, { PresetProgram } from '../../components/PresetProgramsModal';
import { NavigationProp } from '@react-navigation/native';
import { usePrograms } from '../../hooks/usePrograms';
import { useTemplatePrograms } from '../../hooks/useTemplatePrograms';
import { exerciseApi, programApi } from '../../services/api';

import { Program, ProgramExercise } from '../../types';

interface ProgramScreenProps {
  navigation: NavigationProp<any, any>;
}

const ProgramScreen = ({ navigation }: ProgramScreenProps) => {
  const [activeTab, setActiveTab] = useState('mes-programmes');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [showExercises, setShowExercises] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);
  
  // Use hooks
  const { 
    programs, 
    activeProgram, 
    loading: programsLoading, 
    error: programsError,
    total,
    refreshPrograms,
    loadMorePrograms,
    hasMorePrograms,
    startProgram,
    deleteProgram,
    generatePresetProgram
  } = usePrograms({
    autoFetch: true
  });

  const {
    templatePrograms,
    loading: templateProgramsLoading,
    error: templateProgramsError,
    total: templateProgramsTotal,
    refreshTemplatePrograms,
    loadMoreTemplatePrograms,
    hasMoreTemplatePrograms,
  } = useTemplatePrograms({
    autoFetch: true
  });



  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'mes-programmes') {
        await refreshPrograms();
      } else {
        await refreshTemplatePrograms();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
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
  const currentPrograms = activeTab === 'mes-programmes' ? programs : templatePrograms;
  const currentTotal = activeTab === 'mes-programmes' ? total : templateProgramsTotal;
  const currentLoading = activeTab === 'mes-programmes' ? programsLoading : templateProgramsLoading;
  const currentError = activeTab === 'mes-programmes' ? programsError : templateProgramsError;
  const currentHasMore = activeTab === 'mes-programmes' ? hasMorePrograms : hasMoreTemplatePrograms;
  const currentLoadMore = activeTab === 'mes-programmes' ? loadMorePrograms : loadMoreTemplatePrograms;

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

  function getDefaultPresets(): PresetProgram[] {
    return [
      {
        id: 'preset-menstrual-recovery',
        title: 'Récupération douce (Menstruelle)',
        goal: 'Mobilité & respiration',
        phase: 'menstrual',
        durationWeeks: 2,
        exercises: [
          { exerciseTitle: 'Étirements lombaires en douceur', order: 1, duration: 10 },
          { exerciseTitle: 'Respiration profonde et relaxation', order: 2, duration: 10 },
          { exerciseTitle: 'Yoga doux - Étirements en douceur', order: 3, duration: 10 },
        ],
      },
      {
        id: 'preset-follicular-strength',
        title: 'Force & énergie (Folliculaire)',
        goal: 'Renforcement global',
        phase: 'follicular',
        durationWeeks: 4,
        exercises: [
          { exerciseTitle: 'Renforcement bas du corps - Squats', order: 1, sets: 3, reps: '10-12', restTime: 60 },
          { exerciseTitle: 'Cardio léger - Vélo d\'appartement', order: 2, duration: 15 },
          { exerciseTitle: 'Pilates - Core et stabilité', order: 3, duration: 12 },
        ],
      },
      {
        id: 'preset-ovulation-performance',
        title: 'Performance (Ovulation)',
        goal: 'Intensité et explosivité',
        phase: 'ovulation',
        durationWeeks: 3,
        exercises: [
          { exerciseTitle: 'HIIT - Entraînement haute intensité', order: 1, duration: 20 },
          { exerciseTitle: 'Plyométrie légère (sauts contrôlés)', order: 2, duration: 10 },
          { exerciseTitle: 'Course à pied - Tempo', order: 3, duration: 20 },
        ],
      },
      {
        id: 'preset-luteal-balance',
        title: 'Équilibre & contrôle (Lutéale)',
        goal: 'Stabilité et mobilité',
        phase: 'luteal',
        durationWeeks: 3,
        exercises: [
          { exerciseTitle: 'Yoga Power - Force et équilibre', order: 1, duration: 15 },
          { exerciseTitle: 'Marche inclinée (tapis)', order: 2, duration: 15 },
          { exerciseTitle: 'Étirements complets', order: 3, duration: 10 },
        ],
      },
    ];
  }

  async function programApiCreateFromPreset(preset: PresetProgram) {
    console.log('[programApiCreateFromPreset] Creating program from preset:', preset.title);
    console.log('[programApiCreateFromPreset] Preset exercises:', preset.exercises);

    const startDate = new Date().toISOString();
    
    // Resolve exercise IDs by title via backend search if available; fallback to creating a minimal set
    const resolvedExercises = await Promise.all(
      preset.exercises.map(async (ex, index) => {
        console.log(`[programApiCreateFromPreset] Resolving exercise ${index + 1}: "${ex.exerciseTitle}"`);
        try {
          const res = await exerciseApi.searchExercises(ex.exerciseTitle, { limit: 1 });
          console.log(`[programApiCreateFromPreset] Search result for "${ex.exerciseTitle}":`, res);
          
          // Fix: Access exercises from res.data.exercises, not res.exercises
          const found = res.data?.exercises?.[0];
          if (found?.id) {
            console.log(`[programApiCreateFromPreset] ✅ Found exercise: ${found.title} (ID: ${found.id})`);
            return {
              exerciseId: found.id,
              order: ex.order,
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.duration,
              restTime: ex.restTime,
              notes: ex.notes,
            };
          } else {
            console.log(`[programApiCreateFromPreset] ❌ No exercise found for "${ex.exerciseTitle}"`);
          }
        } catch (error) {
          console.error(`[programApiCreateFromPreset] Error searching for "${ex.exerciseTitle}":`, error);
        }
        return null;
      })
    );
    
    const valid = resolvedExercises.filter(Boolean) as any[];
    console.log(`[programApiCreateFromPreset] Resolved ${valid.length} out of ${preset.exercises.length} exercises`);
    console.log('[programApiCreateFromPreset] Valid exercises:', valid);

    if (valid.length === 0) {
      console.warn('[programApiCreateFromPreset] ⚠️ No exercises could be resolved - program will be created without exercises');
      Alert.alert(
        'Attention',
        `Aucun exercice n'a pu être trouvé pour le programme "${preset.title}". Le programme sera créé sans exercices.`,
        [{ text: 'OK' }]
      );
    }

    const programData = {
      title: preset.title,
      goal: preset.goal,
      startDate,
      duration: preset.durationWeeks ? preset.durationWeeks * 7 : undefined,
      exercises: valid,
    };

    console.log('[programApiCreateFromPreset] Creating program with data:', programData);

    return programApi.createProgram(programData);
  }

  // Loading state
  if (currentLoading) {
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
            onPress={() => navigation.navigate('CreateProgram')}
            className="bg-secondary-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm active:bg-secondary-600"
          >
            <Text className="text-surface text-xl mr-2">+</Text>
            <Text className="text-surface font-bold text-lg">Créer un programme personnalisé</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowPresets(true)}
            className="bg-accent-500 rounded-xl p-4 flex-row items-center justify-center shadow-sm active:bg-accent-600"
          >
            <Text className="text-surface text-xl mr-2">📚</Text>
            <Text className="text-surface font-bold text-lg">Choisir un programme préconfiguré</Text>
          </TouchableOpacity>
        </View>

        {/* Programs List */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-4">
            {activeTab === 'mes-programmes' ? `Vos programmes (${currentTotal})` : `Programmes recommandés (${currentTotal})`}
          </Text>
          
          {/* Error state */}
          {currentError && (
            <View className="bg-error-50 border border-error-200 rounded-xl p-4 mb-4 shadow-sm">
              <Text className="text-error-700 text-center">{currentError}</Text>
              <TouchableOpacity 
                onPress={onRefresh}
                className="mt-2 bg-error-100 py-2 px-4 rounded-lg active:bg-error-200"
              >
                <Text className="text-error-700 text-center font-medium">Réessayer</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No programs fallback */}
          {!currentError && currentPrograms.length === 0 && (
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
                  Programmes préconfigurés disponibles
                </Text>
                <Text className="text-primary-600 text-center text-sm">
                  Choisissez un programme préconfiguré adapté à vos objectifs
                </Text>
              </View>
            </View>
          )}

          {/* Programs list */}
          {currentPrograms.map((program: Program) => {
            const progress = calculateProgress(program);
            return (
              <TouchableOpacity
                key={program.id}
                className="bg-surface rounded-xl p-4 mb-4 shadow-sm border border-border-light active:bg-surface-secondary"
                onPress={async () => {
                  try {
                    setLoadingProgramDetails(true);
                    // Load full program details with exercises
                    const fullProgram = await programApi.getProgramById(program.id);
                    setSelectedProgram(fullProgram);
                    setShowExercises(true);
                  } catch (error) {
                    console.error('Error loading program details:', error);
                    Alert.alert('Erreur', 'Impossible de charger les détails du programme');
                  } finally {
                    setLoadingProgramDetails(false);
                  }
                }}
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
                  <View className={`w-3 h-3 rounded-full ${program.isActive ? 'bg-success-500' : 'bg-secondary-300'}`} />
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
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
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
                    className="bg-error-100 py-3 px-4 rounded-lg active:bg-error-200"
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
                      Alert.alert(
                        'Supprimer',
                        'Voulez-vous supprimer ce programme ?',
                        [
                          { text: 'Annuler', style: 'cancel' },
                          { text: 'Supprimer', style: 'destructive', onPress: () => deleteProgram(program.id) }
                        ]
                      );
                    }}
                  >
                    <Text className="text-error-700 font-medium">Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
          {currentHasMore && (
            <View className="mt-2">
              <TouchableOpacity
                onPress={currentLoadMore}
                className="bg-secondary-200 py-3 rounded-lg"
              >
                <Text className="text-secondary-700 font-bold text-center">Charger plus</Text>
              </TouchableOpacity>
            </View>
          )}
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

        {/* Loading indicator for program details */}
        {loadingProgramDetails && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
            <View className="bg-white p-4 rounded-lg">
              <ActivityIndicator size="large" color="#A99985" />
              <Text className="mt-2 text-secondary-600">Chargement...</Text>
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
            programId={selectedProgram.id}
          />
        )}
      </ScrollView>

      {/* Preset Programs Modal */}
      <PresetProgramsModal
        visible={showPresets}
        onClose={() => setShowPresets(false)}
        presets={getDefaultPresets()}
        onPick={async (preset: PresetProgram) => {
          setShowPresets(false);
          try {
            await programApiCreateFromPreset(preset);
            Alert.alert('Créé', 'Programme préconfiguré créé');
            await refreshPrograms();
          } catch (err: any) {
            Alert.alert('Erreur', err?.response?.data?.message || 'Création impossible');
          }
        }}
        onGeneratePreset={async (params) => {
          try {
            console.log('[ProgramScreen] Generating intelligent preset with params:', params);
            const response = await generatePresetProgram(params);
            if (response) {
              console.log('[ProgramScreen] Intelligent preset generated successfully:', response);
              Alert.alert('Succès', 'Programme intelligent généré avec succès !');
              await refreshPrograms();
            } else {
              Alert.alert('Erreur', 'Impossible de générer le programme intelligent');
            }
          } catch (error) {
            console.error('[ProgramScreen] Error generating intelligent preset:', error);
            Alert.alert('Erreur', 'Erreur lors de la génération du programme intelligent');
          }
        }}
      />
    </SafeAreaView>
  );
};

export default ProgramScreen; 
