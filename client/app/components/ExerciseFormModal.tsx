import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { exerciseApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { INTENSITY_OPTIONS, MUSCLE_ZONE_OPTIONS } from '../utils/constants';

interface ExerciseFormModalProps {
  visible: boolean;
  onClose: () => void;
  initial?: {
    id?: string;
    title?: string;
    description?: string;
    duration?: number;
    intensity?: 'LOW' | 'MEDIUM' | 'HIGH';
    category?: string;
    muscleGroups?: string[];
    imageUrl?: string;
  };
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({ visible, onClose, initial }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [duration, setDuration] = useState(initial?.duration?.toString() || '15');
  const [intensity, setIntensity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(initial?.intensity || 'MEDIUM');
  const [category, setCategory] = useState(initial?.category || 'Général');
  const [muscleZone, setMuscleZone] = useState<string>(MUSCLE_ZONE_OPTIONS[0].value);
  const [muscleGroups, setMuscleGroups] = useState<string>(initial?.muscleGroups?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(initial?.title || '');
      setDescription(initial?.description || '');
      setDuration(initial?.duration?.toString() || '15');
      setIntensity((initial?.intensity as any) || 'MEDIUM');
      setCategory(initial?.category || 'Général');
      setMuscleZone(MUSCLE_ZONE_OPTIONS[0].value);
      setMuscleGroups(initial?.muscleGroups?.join(', ') || '');
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }
    if (!initial?.id && !user?.id) {
      Alert.alert('Erreur', 'Utilisateur introuvable');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        userId: initial?.id ? undefined : user?.id,
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'Général',
        intensity,
        muscleGroups: muscleGroups
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        duration: parseInt(duration || '0', 10) || 0,
        imageUrl: undefined as string | undefined,
      };

      if (initial?.id) {
        await exerciseApi.updateExercise(initial.id, payload);
        Alert.alert('Mis à jour', 'Exercice modifié avec succès');
      } else {
        await exerciseApi.createExercise(payload);
        Alert.alert('Créé', 'Exercice créé avec succès');
      }
      onClose();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible d\'enregistrer l\'exercice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-brand-background">
        <ScrollView className="flex-1 px-6 pt-12">
          <Text className="text-2xl font-bold text-brand-text mb-6">
            {initial?.id ? 'Modifier un exercice' : 'Nouvel exercice'}
          </Text>

          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-secondary-600 mb-2">Titre</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface"
              placeholder="Ex: Fentes marchées"
              placeholderTextColor="#A99985"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-secondary-600 mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface"
              placeholder="Décrivez l\'exercice"
              placeholderTextColor="#A99985"
              multiline
            />
          </View>

          {/* Duration */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-secondary-600 mb-2">Durée (min)</Text>
            <TextInput
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface"
              placeholder="15"
              placeholderTextColor="#A99985"
            />
          </View>

          {/* Intensity dropdown */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-secondary-600 mb-2">Intensité</Text>
            <View className="flex-row flex-wrap">
              {INTENSITY_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setIntensity(opt.value as any)}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 border ${
                    intensity === (opt.value as any) ? 'bg-primary-500 border-primary-500' : 'bg-surface border-border'
                  }`}
                >
                  <Text className={`${intensity === (opt.value as any) ? 'text-surface' : 'text-brand-text'}`}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Muscle zone (single) */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-secondary-600 mb-2">Zone musculaire</Text>
            <View className="flex-row flex-wrap">
              {MUSCLE_ZONE_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setMuscleZone(opt.value)}
                  className={`px-3 py-2 rounded-lg mr-2 mb-2 border ${
                    muscleZone === opt.value ? 'bg-accent-500 border-accent-500' : 'bg-surface border-border'
                  }`}
                >
                  <Text className={`${muscleZone === opt.value ? 'text-surface' : 'text-brand-text'}`}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Muscle groups (csv) */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-secondary-600 mb-2">Groupes musculaires (séparés par des virgules)</Text>
            <TextInput
              value={muscleGroups}
              onChangeText={setMuscleGroups}
              className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface"
              placeholder="Quadriceps, Ischios, Fessiers"
              placeholderTextColor="#A99985"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="px-6 py-4 border-t border-border bg-surface">
          <View className="flex-row space-x-3">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-secondary-200 py-3 rounded-lg">
              <Text className="text-secondary-700 font-bold text-center">Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="flex-1 bg-primary-500 py-3 rounded-lg" disabled={saving}>
              <Text className="text-surface font-bold text-center">Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExerciseFormModal;


