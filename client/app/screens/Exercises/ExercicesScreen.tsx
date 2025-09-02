import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCycleContext } from '../../context/CycleContext';
import { exerciseApi } from '../../services/api';
import ExerciseFormModal from '../../components/ExerciseFormModal';
import { INTENSITY_OPTIONS, MUSCLE_ZONE_OPTIONS, getIntensityLabel, getMuscleZoneLabel } from '../../utils/constants';

interface Exercise {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  intensity?: string;
  muscleZone?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const ExercicesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList, 'Exercices'>>();
  const { user } = useAuth();
  const { currentCycle, getPhaseApiKey } = useCycleContext();
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  
  // Filters
  const [showAllExercises, setShowAllExercises] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<string>('follicular');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('');
  const [selectedMuscleZone, setSelectedMuscleZone] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  const phases = [
    { value: 'menstrual', label: 'Menstruelle' },
    { value: 'follicular', label: 'Folliculaire' },
    { value: 'ovulation', label: 'Ovulation' },
    { value: 'luteal', label: 'Lutéale' }
  ];

  useEffect(() => {
    // Update selected phase based on current cycle using getPhaseApiKey
    if (currentCycle && getPhaseApiKey) {
      const currentPhaseKey = getPhaseApiKey();
      if (currentPhaseKey) {
        setSelectedPhase(currentPhaseKey);
      }
    }
  }, [currentCycle, getPhaseApiKey]);

  useEffect(() => {
    // Reset to first page and clear exercises when filters change
    setCurrentPage(1);
    setExercises([]);
    fetchExercises(true);
  }, [selectedPhase, selectedIntensity, selectedMuscleZone, showAllExercises]);

  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        setExercises([]);
        fetchExercises(true);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    // Handle pagination
    if (currentPage > 1) {
      fetchExercises();
    }
  }, [currentPage]);

  const fetchExercises = useCallback(async (isRefresh = false) => {
    try {
      setLoading(true);
      
      const params: any = {
        limit: itemsPerPage,
        offset: isRefresh ? 0 : (currentPage - 1) * itemsPerPage
      };

      if (!showAllExercises && selectedPhase) {
        params.phase = selectedPhase;
      } else if (!showAllExercises && getPhaseApiKey) {
        // Use current cycle phase if no specific phase selected
        params.phase = getPhaseApiKey();
      }
      
      if (selectedIntensity) {
        params.intensity = selectedIntensity;
      }
      
      if (selectedMuscleZone) {
        params.muscleZone = selectedMuscleZone;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await exerciseApi.getExercises(params);
      const exercisesData = response.data || response;
      
      // Ensure we have unique exercises by ID
      const newExercises = exercisesData.exercises || [];
      const uniqueExercises = newExercises.filter((exercise: Exercise, index: number, self: Exercise[]) => 
        index === self.findIndex((e: Exercise) => e.id === exercise.id)
      );
      
      if (isRefresh) {
        setExercises(uniqueExercises);
        setCurrentPage(1);
      } else {
        setExercises(prev => {
          const combined = [...prev, ...uniqueExercises];
          // Remove duplicates based on ID
          return combined.filter((exercise, index, self) => 
            index === self.findIndex(e => e.id === exercise.id)
          );
        });
      }
      
      setHasMore(uniqueExercises.length === itemsPerPage);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      Alert.alert('Erreur', 'Impossible de charger les exercices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, showAllExercises, selectedPhase, selectedIntensity, selectedMuscleZone, searchQuery, itemsPerPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExercises(true);
  }, [fetchExercises]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, loading]);

  const handleCreateExercise = async (exerciseData: any) => {
    try {
      const newExercise = await exerciseApi.createExercise(exerciseData);
      setExercises(prev => [newExercise, ...prev]);
      Alert.alert('Succès', 'Exercice créé avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de créer l\'exercice');
    }
  };

  const handleUpdateExercise = async (exerciseData: any) => {
    if (!editingExercise) return;
    
    try {
      const updatedExercise = await exerciseApi.updateExercise(editingExercise.id, exerciseData);
      setExercises(prev => prev.map(ex => ex.id === editingExercise.id ? updatedExercise : ex));
      setEditingExercise(null);
      Alert.alert('Succès', 'Exercice mis à jour avec succès');
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de mettre à jour l\'exercice');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet exercice ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await exerciseApi.deleteExercise(exerciseId);
              setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
              Alert.alert('Succès', 'Exercice supprimé avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de supprimer l\'exercice');
            }
          }
        }
      ]
    );
  };

  const filteredExercises = exercises.filter(exercise => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!exercise.title.toLowerCase().includes(query) && 
          !exercise.description?.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  const clearFilters = () => {
    setSelectedIntensity('');
    setSelectedMuscleZone('');
    setSearchQuery('');
    setCurrentPage(1);
    // The useEffect will handle fetching exercises when these values change
  };

  const renderExerciseCard = useCallback((exercise: Exercise) => (
    <TouchableOpacity 
      className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
      onPress={() => {
        const params = { exerciseId: exercise.id };
        (navigation as any).navigate('ExerciseDetail', params);
      }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-2">
            {exercise.title}
          </Text>
          
          {exercise.description && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {exercise.description}
            </Text>
          )}
          
          <View className="flex-row items-center space-x-4 mb-2">
            {exercise.duration && (
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 mr-1">Durée:</Text>
                <Text className="text-sm font-medium text-brand-dark-bg">
                  {exercise.duration}min
                </Text>
              </View>
            )}
            
            {exercise.intensity && (
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 mr-1">Intensité:</Text>
                <Text className="text-sm font-medium text-brand-dark-bg">
                  {getIntensityLabel(exercise.intensity)}
                </Text>
              </View>
            )}
            
            {exercise.muscleZone && (
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600 mr-1">Zone:</Text>
                <Text className="text-sm font-medium text-brand-dark-bg">
                  {getMuscleZoneLabel(exercise.muscleZone)}
                </Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center space-x-2">
            {exercise.createdBy ? (
              <View className="bg-blue-100 px-2 py-1 rounded">
                <Text className="text-xs text-blue-700">Personnel</Text>
              </View>
            ) : (
              <View className="bg-green-100 px-2 py-1 rounded">
                <Text className="text-xs text-green-700">Système</Text>
              </View>
            )}
          </View>
        </View>
        
        <View className="flex-row space-x-2">
          {exercise.createdBy === user?.id && (
            <>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setEditingExercise(exercise);
                }}
                className="bg-blue-100 p-2 rounded-lg"
              >
                <Text className="text-blue-600 font-bold">✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteExercise(exercise.id);
                }}
                className="bg-red-100 p-2 rounded-lg"
              >
                <Text className="text-red-600 font-bold">🗑️</Text>
              </TouchableOpacity>
            </>
          )}
          <View className="bg-primary-100 p-2 rounded-lg">
            <Text className="text-primary-600 font-bold">👁️</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  return (
    <View className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4 pt-12">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-brand-dark-bg">
            Exercices
          </Text>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-primary-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">+ Créer</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View className="mb-4">
          <Text className="text-xs text-gray-500 mb-1">Rechercher</Text>
          <View className="bg-gray-100 rounded-lg px-3 py-2">
            <TextInput
              placeholder="Rechercher un exercice..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-sm text-gray-700"
            />
          </View>
        </View>

        {/* Toggle Mode */}
        <View className="flex-row bg-gray-100 rounded-lg p-1 mb-4">
          <TouchableOpacity
            onPress={() => setShowAllExercises(false)}
            className={`flex-1 py-2 px-4 rounded-md ${
              !showAllExercises ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              !showAllExercises ? 'text-primary-600' : 'text-gray-600'
            }`}>
              Adaptés au cycle
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowAllExercises(true)}
            className={`flex-1 py-2 px-4 rounded-md ${
              showAllExercises ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-medium ${
              showAllExercises ? 'text-primary-600' : 'text-gray-600'
            }`}>
              Tous les exercices
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="mb-4">
                    {!showAllExercises && (
            <View className="mb-3">
              <Text className="text-xs text-gray-500 mb-1">Phase</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {phases.map((phase) => (
                    <TouchableOpacity
                      key={phase.value}
                      onPress={() => setSelectedPhase(phase.value)}
                      className={`px-3 py-1 rounded-full mr-2 ${
                        selectedPhase === phase.value
                          ? 'bg-primary-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          selectedPhase === phase.value ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {phase.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">Intensité</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {INTENSITY_OPTIONS.map((intensity) => (
                  <TouchableOpacity
                    key={intensity.value}
                    onPress={() => setSelectedIntensity(
                      selectedIntensity === intensity.value ? '' : intensity.value
                    )}
                    className={`px-3 py-1 rounded-full mr-2 ${
                          selectedIntensity === intensity.value
                            ? 'bg-primary-500'
                            : 'bg-gray-200'
                        }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedIntensity === intensity.value ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {intensity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="mb-3">
            <Text className="text-xs text-gray-500 mb-1">Zone musculaire</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {MUSCLE_ZONE_OPTIONS.map((zone) => (
                  <TouchableOpacity
                    key={zone.value}
                    onPress={() => setSelectedMuscleZone(
                      selectedMuscleZone === zone.value ? '' : zone.value
                    )}
                    className={`px-3 py-1 rounded-full mr-2 ${
                          selectedMuscleZone === zone.value
                            ? 'bg-primary-500'
                            : 'bg-gray-200'
                        }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedMuscleZone === zone.value ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {zone.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Clear Filters */}
        {(selectedIntensity || selectedMuscleZone || searchQuery) && (
          <TouchableOpacity
            onPress={clearFilters}
            className="self-start bg-gray-200 px-3 py-1 rounded-full mb-2"
          >
            <Text className="text-xs text-gray-600">Effacer les filtres</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Exercise List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= 
              contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && exercises.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-lg text-gray-500">Chargement...</Text>
          </View>
        ) : filteredExercises.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-lg text-gray-500 text-center mb-4">
              Aucun exercice trouvé
            </Text>
            <Text className="text-sm text-gray-400 text-center">
              Essayez de modifier vos filtres ou créez un nouvel exercice
            </Text>
          </View>
        ) : (
          <>
            {filteredExercises.map((exercise) => (
              <View key={exercise.id}>
                {renderExerciseCard(exercise)}
              </View>
            ))}
            {hasMore && (
              <View className="py-4">
                <Text className="text-center text-gray-500">Chargement...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <ExerciseFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateExercise}
      />

      <ExerciseFormModal
        visible={!!editingExercise}
        onClose={() => setEditingExercise(null)}
        onSave={handleUpdateExercise}
        initial={editingExercise}
      />
    </View>
  );
};

export default ExercicesScreen; 
