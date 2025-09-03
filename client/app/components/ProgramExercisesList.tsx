import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { ProgramExercise } from '../types';
import { programApi, exerciseApi } from '../services/api';
import { getIntensityLabel, getMuscleZoneLabel } from '../utils/constants';

interface ProgramExercisesListProps {
  exercises: ProgramExercise[];
  visible: boolean;
  onClose: () => void;
  programTitle: string;
  programId: string;
}

interface Exercise {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  intensity?: string;
  muscleZone?: string;
}

const ProgramExercisesList: React.FC<ProgramExercisesListProps> = ({
  exercises,
  visible,
  onClose,
  programTitle,
  programId
}) => {
  const [localExercises, setLocalExercises] = useState<ProgramExercise[]>(exercises);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const sortedExercises = useMemo(() => [...localExercises].sort((a, b) => a.order - b.order), [localExercises]);
  const filteredExercises = useMemo(() => 
    availableExercises.filter(ex => 
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleZone?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [availableExercises, searchQuery]
  );

  // Load available exercises when modal opens
  useEffect(() => {
    if (visible) {
      loadAvailableExercises();
    }
  }, [visible]);

  const loadAvailableExercises = async () => {
    try {
      setLoading(true);
      const response = await exerciseApi.getExercises({ limit: 50 });
      const exercisesData = response.data || response;
      setAvailableExercises(exercisesData.exercises || []);
    } catch (err: any) {
      console.error('Error loading exercises:', err);
      Alert.alert('Erreur', 'Impossible de charger les exercices disponibles');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (duration?: number): string => {
    if (!duration) return '';
    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return seconds > 0 ? `${minutes}min ${seconds}s` : `${minutes}min`;
  };

  const formatRestTime = (restTime?: number): string => {
    if (!restTime) return '';
    if (restTime < 60) return `${restTime}s`;
    const minutes = Math.floor(restTime / 60);
    const seconds = restTime % 60;
    return seconds > 0 ? `${minutes}min ${seconds}s` : `${minutes}min`;
  };

  const handleRemove = async (programExercise: ProgramExercise) => {
    try {
      if (!programExercise.id) return;
      await programApi.removeProgramExercise(programId, programExercise.id);
      setLocalExercises(prev => prev.filter(e => e.id !== programExercise.id));
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Suppression impossible.');
    }
  };

  const handleAddExercise = async (exercise: Exercise) => {
    try {
      const newOrder = localExercises.length + 1;
      await programApi.addExerciseToProgram(programId, {
        exerciseId: exercise.id,
        order: newOrder,
        sets: 3,
        reps: '10-12',
        duration: exercise.duration || 60,
        restTime: 90,
        notes: `Ajouté depuis la bibliothèque d'exercices`
      });
      
      // Add to local state
      const newProgramExercise: ProgramExercise = {
        id: `temp-${Date.now()}`, // Temporary ID
        programId,
        exerciseId: exercise.id,
        order: newOrder,
        sets: 3,
        reps: '10-12',
        duration: exercise.duration || 60,
        restTime: 90,
        notes: `Ajouté depuis la bibliothèque d'exercices`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLocalExercises(prev => [...prev, newProgramExercise]);
      setShowAddExercise(false);
      setSearchQuery('');
      Alert.alert('Succès', 'Exercice ajouté au programme');
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible d\'ajouter l\'exercice');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-brand-background">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4 pt-12">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-xl font-bold text-brand-dark-bg" numberOfLines={2}>
                {programTitle}
              </Text>
              <Text className="text-sm text-brand-dark-surface mt-1">
                {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity
                onPress={() => setShowAddExercise(true)}
                className="bg-primary-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium text-sm">+ Ajouter</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
              >
                <Text className="text-gray-600 font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Exercise List */}
        <ScrollView className="flex-1 px-6 py-4">
          {sortedExercises.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-lg text-gray-500 text-center mb-4">
                Aucun exercice dans ce programme
              </Text>
              <Text className="text-sm text-gray-400 text-center">
                Ajoutez des exercices pour commencer
              </Text>
            </View>
          ) : (
            sortedExercises.map((programExercise, index) => (
              <View key={programExercise.id || index} className="bg-white rounded-lg p-4 mb-3 border border-gray-100">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-brand-dark-bg mb-2">
                      {programExercise.exercise?.title || 'Exercice'}
                    </Text>
                    
                    <View className="flex-row items-center space-x-4 mb-2">
                      {programExercise.sets && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Séries:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{programExercise.sets}</Text>
                        </View>
                      )}
                      
                      {programExercise.reps && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Répétitions:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{programExercise.reps}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="flex-row items-center space-x-4">
                      {programExercise.duration && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Durée:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{formatDuration(programExercise.duration)}</Text>
                        </View>
                      )}
                      
                      {programExercise.restTime && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Repos:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{formatRestTime(programExercise.restTime)}</Text>
                        </View>
                      )}
                    </View>
                    
                    {programExercise.notes && (
                      <Text className="text-sm text-gray-500 mt-2 italic">
                        {programExercise.notes}
                      </Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => handleRemove(programExercise)}
                    className="bg-red-100 p-2 rounded-lg ml-3"
                  >
                    <Text className="text-red-600 font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Add Exercise Modal */}
        <Modal
          visible={showAddExercise}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddExercise(false)}
        >
          <View className="flex-1 bg-brand-background">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-6 py-4 pt-12">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-brand-dark-bg">
                  Ajouter un exercice
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAddExercise(false)}
                  className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                >
                  <Text className="text-gray-600 font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Search */}
            <View className="bg-white px-6 py-4 border-b border-gray-200">
              <TextInput
                placeholder="Rechercher un exercice..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-gray-100 px-4 py-3 rounded-lg text-base"
              />
            </View>

            {/* Exercise List */}
            <ScrollView className="flex-1 px-6 py-4">
              {loading ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Text className="text-lg text-gray-500">Chargement...</Text>
                </View>
              ) : filteredExercises.length === 0 ? (
                <View className="flex-1 items-center justify-center py-20">
                  <Text className="text-lg text-gray-500 text-center mb-4">
                    {searchQuery ? 'Aucun exercice trouvé' : 'Aucun exercice disponible'}
                  </Text>
                  {searchQuery && (
                    <Text className="text-sm text-gray-400 text-center">
                      Essayez de modifier votre recherche
                    </Text>
                  )}
                </View>
              ) : (
                filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => handleAddExercise(exercise)}
                    className="bg-white rounded-lg p-4 mb-3 border border-gray-100 active:bg-gray-50"
                  >
                    <Text className="text-lg font-semibold text-brand-dark-bg mb-2">
                      {exercise.title}
                    </Text>
                    
                    {exercise.description && (
                      <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                        {exercise.description}
                      </Text>
                    )}
                    
                    <View className="flex-row items-center space-x-4">
                      {exercise.duration && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Durée:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{formatDuration(exercise.duration)}</Text>
                        </View>
                      )}
                      
                      {exercise.intensity && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Intensité:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{getIntensityLabel(exercise.intensity)}</Text>
                        </View>
                      )}
                      
                      {exercise.muscleZone && (
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-600 mr-1">Zone:</Text>
                          <Text className="text-sm font-medium text-brand-dark-bg">{getMuscleZoneLabel(exercise.muscleZone)}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

export default ProgramExercisesList;
