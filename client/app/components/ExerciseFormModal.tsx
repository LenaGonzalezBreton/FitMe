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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!intensity) {
      newErrors.intensity = 'L\'intensité est requise';
    }
    
    if (!muscleZone) {
      newErrors.muscleZone = 'La zone musculaire est requise';
    }
    
    if (duration && isNaN(Number(duration))) {
      newErrors.duration = 'La durée doit être un nombre';
    } else if (duration && Number(duration) < 1) {
      newErrors.duration = 'La durée doit être d\'au moins 1 minute';
    }
    
    // Validate URL format if provided
    if (imageUrl && imageUrl.trim()) {
      const urlPattern = /^https?:\/\/.+\..+/;
      if (!urlPattern.test(imageUrl.trim())) {
        newErrors.imageUrl = 'Veuillez entrer une URL valide (http://... ou https://...)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
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
        description: description.trim() || undefined,
        intensity: intensity as 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH',
        muscleZone: muscleZone || undefined,
        duration: duration ? Number(duration) : undefined,
        imageUrl: imageUrl.trim() || undefined,
      };

      if (initial?.id) {
        // Update existing exercise
        const updatedExercise = await exerciseApi.updateExercise(initial.id, exerciseData);
        onSave(updatedExercise);
      } else {
        // Create new exercise
        const response = await exerciseApi.createExercise(exerciseData);
        const newExercise = response.exercise || response;
        onSave(newExercise);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving exercise:', error);
      const errorMessages = error?.response?.data?.message;
      const errorText = Array.isArray(errorMessages) ? errorMessages.join(', ') : (errorMessages || 'Impossible d\'enregistrer l\'exercice');
      Alert.alert('Erreur', errorText);
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
    setErrors({});
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
        <View className="px-6 py-4 pt-12 bg-white border-b border-gray-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-brand-dark-bg">
              {initial ? 'Modifier l\'exercice' : 'Créer un exercice'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="justify-center items-center w-8 h-8 bg-gray-100 rounded-full"
            >
              <Text className="font-bold text-gray-600">✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <ScrollView className="flex-1 px-6 py-4">
          {/* Title */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-brand-dark-bg">
              Titre *
            </Text>
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Nom de l'exercice"
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <Text className="mt-1 text-xs text-red-500">{errors.title}</Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-brand-dark-bg">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description de l'exercice"
              multiline
              numberOfLines={3}
              className="px-4 py-3 text-base bg-white rounded-lg border border-gray-300"
            />
          </View>

          {/* Duration */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-brand-dark-bg">
              Durée (minutes) - minimum 1 min
            </Text>
            <TextInput
              value={duration}
              onChangeText={(text) => {
                setDuration(text);
                if (errors.duration) {
                  setErrors(prev => ({ ...prev, duration: '' }));
                }
              }}
              placeholder="15"
              keyboardType="numeric"
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration && (
              <Text className="mt-1 text-xs text-red-500">{errors.duration}</Text>
            )}
          </View>

          {/* Intensity */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-brand-dark-bg">
              Intensité *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {INTENSITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setIntensity(option.value);
                    if (errors.intensity) {
                      setErrors(prev => ({ ...prev, intensity: '' }));
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    intensity === option.value
                      ? 'bg-primary-500 border-primary-500'
                      : errors.intensity
                      ? 'bg-white border-red-500'
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
            {errors.intensity && (
              <Text className="mt-1 text-xs text-red-500">{errors.intensity}</Text>
            )}
          </View>

          {/* Muscle Zone */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-brand-dark-bg">
              Zone musculaire *
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {MUSCLE_ZONE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setMuscleZone(option.value);
                    if (errors.muscleZone) {
                      setErrors(prev => ({ ...prev, muscleZone: '' }));
                    }
                  }}
                  className={`px-4 py-2 rounded-lg border ${
                    muscleZone === option.value
                      ? 'bg-primary-500 border-primary-500'
                      : errors.muscleZone
                      ? 'bg-white border-red-500'
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
            {errors.muscleZone && (
              <Text className="mt-1 text-xs text-red-500">{errors.muscleZone}</Text>
            )}
          </View>

          {/* Image URL */}
          <View className="mb-6">
            <Text className="mb-2 text-sm font-medium text-brand-dark-bg">
              URL de l'image
            </Text>
            <TextInput
              value={imageUrl}
              onChangeText={(text) => {
                setImageUrl(text);
                if (errors.imageUrl) {
                  setErrors(prev => ({ ...prev, imageUrl: '' }));
                }
              }}
              placeholder="https://example.com/image.jpg"
              className={`bg-white border rounded-lg px-4 py-3 text-base ${
                errors.imageUrl ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.imageUrl && (
              <Text className="mt-1 text-xs text-red-500">{errors.imageUrl}</Text>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`py-3 rounded-xl ${saving ? 'bg-gray-400' : 'bg-primary-500'}`}
          >
            <Text className="font-bold text-center text-white">
              {saving ? 'Enregistrement...' : (initial ? 'Mettre à jour' : 'Créer l\'exercice')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ExerciseFormModal;


