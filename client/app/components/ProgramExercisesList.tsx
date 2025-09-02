import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { ProgramExercise } from '../types';

interface ProgramExercisesListProps {
  exercises: ProgramExercise[];
  visible: boolean;
  onClose: () => void;
  programTitle: string;
}

const ProgramExercisesList: React.FC<ProgramExercisesListProps> = ({
  exercises,
  visible,
  onClose,
  programTitle
}) => {
  const sortedExercises = [...exercises].sort((a, b) => a.order - b.order);

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
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center ml-4"
            >
              <Text className="text-gray-600 font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercises List */}
        <ScrollView className="flex-1 px-6 py-4">
          {sortedExercises.map((exercise, index) => (
            <View key={exercise.id || index} className="bg-white rounded-xl p-4 mb-4">
              {/* Exercise Order & Title */}
              <View className="flex-row items-start mb-3">
                <View className="bg-primary-500 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-white font-bold text-sm">{exercise.order}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-brand-dark-bg mb-1">
                    Exercice {exercise.order}
                  </Text>
                  <Text className="text-xs text-brand-dark-surface">
                    ID: {exercise.exerciseId}
                  </Text>
                </View>
              </View>

              {/* Exercise Details */}
              <View className="ml-11">
                {/* Sets & Reps */}
                {(exercise.sets || exercise.reps) && (
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-brand-dark-bg mb-1">
                      Séries et répétitions
                    </Text>
                    <View className="flex-row space-x-4">
                      {exercise.sets && (
                        <View className="bg-primary-50 px-3 py-1 rounded-lg">
                          <Text className="text-primary-700 text-sm font-medium">
                            {exercise.sets} série{exercise.sets > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                      {exercise.reps && (
                        <View className="bg-primary-50 px-3 py-1 rounded-lg">
                          <Text className="text-primary-700 text-sm font-medium">
                            {exercise.reps} rép
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Duration */}
                {exercise.duration && (
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-brand-dark-bg mb-1">
                      Durée
                    </Text>
                    <View className="bg-accent-50 px-3 py-1 rounded-lg self-start">
                      <Text className="text-accent-700 text-sm font-medium">
                        {formatDuration(exercise.duration)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Rest Time */}
                {exercise.restTime && (
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-brand-dark-bg mb-1">
                      Temps de repos
                    </Text>
                    <View className="bg-orange-50 px-3 py-1 rounded-lg self-start">
                      <Text className="text-orange-700 text-sm font-medium">
                        {formatRestTime(exercise.restTime)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Notes */}
                {exercise.notes && (
                  <View className="mb-2">
                    <Text className="text-sm font-medium text-brand-dark-bg mb-1">
                      Notes
                    </Text>
                    <View className="bg-gray-50 p-3 rounded-lg">
                      <Text className="text-gray-700 text-sm">
                        {exercise.notes}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Dates */}
                <View className="mt-2 pt-2 border-t border-gray-100">
                  <Text className="text-xs text-brand-dark-surface">
                    Ajouté le {exercise.createdAt ? new Date(exercise.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {exercises.length === 0 && (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-lg font-bold text-brand-dark-bg mb-2">
                Aucun exercice configuré
              </Text>
              <Text className="text-brand-dark-surface text-center">
                Ce programme n'a pas encore d'exercices détaillés.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View className="bg-white border-t border-gray-200 px-6 py-4">
          <TouchableOpacity
            onPress={onClose}
            className="bg-brand-brown py-3 rounded-xl"
          >
            <Text className="text-white font-bold text-center">Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProgramExercisesList;
