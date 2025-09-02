import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { INTENSITY_OPTIONS, MUSCLE_ZONE_OPTIONS } from '../utils/constants';
import { exerciseApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ExerciseFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: any) => void;
  initial?: any;
}

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initial
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [duration, setDuration] = useState(initial?.duration?.toString() || '');
  const [intensity, setIntensity] = useState(initial?.intensity || '');
  const [muscleZone, setMuscleZone] = useState(initial?.muscleZone || '');
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setDuration(initial.duration?.toString() || '');
      setIntensity(initial.intensity || '');
      setMuscleZone(initial.muscleZone || '');
      setImageUrl(initial.imageUrl || '');
    }
  }, [initial]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }

    if (duration && isNaN(Number(duration))) {
      Alert.alert('Erreur', 'La durée doit être un nombre');
      return;
    }

    if (duration && Number(duration) < 10) {
      Alert.alert('Erreur', 'La durée doit être d\'au moins 10 minutes');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setSaving(true);
      
      const exerciseData = {
        title: title.trim(),
        description: description.trim() || '',
        intensity: intensity as 'LOW' | 'MEDIUM' | 'HIGH',
        muscleZone: muscleZone || '',
        duration: duration ? Number(duration) : 15, // Default duration (minimum 10 required by API)
        imageUrl: imageUrl.trim() || undefined,
      };

      if (initial?.id) {
        // Update existing exercise
        const updatedExercise = await exerciseApi.updateExercise(initial.id, exerciseData);
        onSave(updatedExercise);
      } else {
        // Create new exercise
        const newExercise = await exerciseApi.createExercise(exerciseData);
        onSave(newExercise);
      }
      
      onClose();
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible d\'enregistrer l\'exercice');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDuration('');
    setIntensity('');
    setMuscleZone('');
    setImageUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-brand-background">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4 pt-12">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-brand-dark-bg">
              {initial ? 'Modifier l\'exercice' : 'Créer un exercice'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <ScrollView className="flex-1 px-6 py-4">
          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-brand-dark-bg mb-2">
              Titre *
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Nom de l'exercice"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-brand-dark-bg mb-2">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description de l'exercice"
              multiline
              numberOfLines={3}
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            />
          </View>

          {/* Duration */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-brand-dark-bg mb-2">
              Durée (minutes)
            </Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              placeholder="15"
              keyboardType="numeric"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            />
          </View>

          {/* Intensity */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-brand-dark-bg mb-2">
              Intensité
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {INTENSITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setIntensity(option.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    intensity === option.value
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      intensity === option.value ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Muscle Zone */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-brand-dark-bg mb-2">
              Zone musculaire
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {MUSCLE_ZONE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setMuscleZone(option.value)}
                  className={`px-4 py-2 rounded-lg border ${
                    muscleZone === option.value
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      muscleZone === option.value ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image URL */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-brand-dark-bg mb-2">
              URL de l'image
            </Text>
            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="bg-white border-t border-gray-200 px-6 py-4">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`py-3 rounded-xl ${saving ? 'bg-gray-400' : 'bg-primary-500'}`}
          >
            <Text className="text-white font-bold text-center">
              {saving ? 'Enregistrement...' : (initial ? 'Mettre à jour' : 'Créer')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ExerciseFormModal;


