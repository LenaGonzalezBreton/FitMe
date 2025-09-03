import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Picker } from 'react-native';

export type PresetExercise = {
  exerciseTitle: string;
  order: number;
  sets?: number;
  reps?: string;
  duration?: number;
  restTime?: number;
  notes?: string;
};

export type PresetProgram = {
  id: string;
  title: string;
  goal?: string;
  phase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  durationWeeks?: number;
  exercises: PresetExercise[];
};

interface PresetProgramsModalProps {
  visible: boolean;
  onClose: () => void;
  presets: PresetProgram[];
  onPick: (preset: PresetProgram) => void;
  onGeneratePreset?: (params: {
    programType: 'cardio' | 'strength' | 'flexibility' | 'mixed';
    duration?: number;
    focusZone?: 'UPPER_BODY' | 'LOWER_BODY' | 'CORE' | 'FULL_BODY' | 'CARDIO' | 'FLEXIBILITY' | 'BALANCE';
    title?: string;
    goal?: string;
  }) => Promise<void>;
}

const PresetProgramsModal: React.FC<PresetProgramsModalProps> = ({ visible, onClose, presets, onPick, onGeneratePreset }) => {
  const [showSmartGeneration, setShowSmartGeneration] = useState(false);
  const [generatingPreset, setGeneratingPreset] = useState(false);
  const [selectedProgramType, setSelectedProgramType] = useState<'cardio' | 'strength' | 'flexibility' | 'mixed'>('mixed');
  const [selectedFocusZone, setSelectedFocusZone] = useState<'UPPER_BODY' | 'LOWER_BODY' | 'CORE' | 'FULL_BODY' | 'CARDIO' | 'FLEXIBILITY' | 'BALANCE'>('FULL_BODY');
  const [selectedDuration, setSelectedDuration] = useState(14);

  const handleGeneratePreset = async () => {
    if (!onGeneratePreset) return;
    
    setGeneratingPreset(true);
    try {
      await onGeneratePreset({
        programType: selectedProgramType,
        duration: selectedDuration,
        focusZone: selectedFocusZone,
        title: `Programme ${selectedProgramType === 'cardio' ? 'Cardio' : selectedProgramType === 'strength' ? 'Renforcement' : selectedProgramType === 'flexibility' ? 'Flexibilité' : 'Mixte'} Intelligent`,
        goal: `Programme adapté à votre phase avec focus ${selectedFocusZone.toLowerCase().replace('_', ' ')}`
      });
      onClose();
    } catch (error) {
      console.error('Error generating preset:', error);
      Alert.alert('Erreur', 'Impossible de générer le programme intelligent');
    } finally {
      setGeneratingPreset(false);
      setShowSmartGeneration(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-brand-background">
        <View className="px-6 pt-12 pb-4 border-b border-border bg-surface">
          <Text className="text-2xl font-bold text-brand-text">Programmes préconfigurés</Text>
          <Text className="text-secondary-600 mt-1">Sélectionnez un programme adapté à votre phase ou générez-en un intelligent</Text>
        </View>
        <ScrollView className="flex-1 px-6 py-4">
          {/* Smart Generation Section */}
          {onGeneratePreset && (
            <View className="mb-6">
              <View className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl p-4 mb-4">
                <Text className="text-surface font-bold text-lg mb-2">🤖 Génération Intelligente</Text>
                <Text className="text-surface/90 text-sm mb-3">
                  Laissez notre IA créer un programme personnalisé avec vos exercices et des exercices publics adaptés à votre phase
                </Text>
                <TouchableOpacity
                  onPress={() => setShowSmartGeneration(!showSmartGeneration)}
                  className="bg-surface/20 py-2 px-4 rounded-lg"
                >
                  <Text className="text-surface font-bold text-center">
                    {showSmartGeneration ? 'Masquer les options' : 'Configurer et générer'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Smart Generation Options */}
              {showSmartGeneration && (
                <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light">
                  <Text className="text-brand-text font-bold mb-4">Configuration du programme intelligent</Text>
                  
                  {/* Program Type */}
                  <View className="mb-4">
                    <Text className="text-secondary-700 font-medium mb-2">Type de programme</Text>
                    <View className="flex-row flex-wrap">
                      {[{ key: 'mixed', label: 'Mixte' }, { key: 'cardio', label: 'Cardio' }, { key: 'strength', label: 'Renforcement' }, { key: 'flexibility', label: 'Flexibilité' }].map((type) => (
                        <TouchableOpacity
                          key={type.key}
                          onPress={() => setSelectedProgramType(type.key as any)}
                          className={`mr-2 mb-2 px-3 py-2 rounded-lg ${
                            selectedProgramType === type.key ? 'bg-primary-500' : 'bg-secondary-100'
                          }`}
                        >
                          <Text className={`font-medium ${
                            selectedProgramType === type.key ? 'text-surface' : 'text-secondary-700'
                          }`}>
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Focus Zone */}
                  <View className="mb-4">
                    <Text className="text-secondary-700 font-medium mb-2">Zone de focus</Text>
                    <View className="flex-row flex-wrap">
                      {[
                        { key: 'FULL_BODY', label: 'Corps entier' },
                        { key: 'UPPER_BODY', label: 'Haut du corps' },
                        { key: 'LOWER_BODY', label: 'Bas du corps' },
                        { key: 'CORE', label: 'Core' },
                        { key: 'CARDIO', label: 'Cardio' },
                        { key: 'FLEXIBILITY', label: 'Flexibilité' }
                      ].map((zone) => (
                        <TouchableOpacity
                          key={zone.key}
                          onPress={() => setSelectedFocusZone(zone.key as any)}
                          className={`mr-2 mb-2 px-3 py-2 rounded-lg ${
                            selectedFocusZone === zone.key ? 'bg-primary-500' : 'bg-secondary-100'
                          }`}
                        >
                          <Text className={`text-xs font-medium ${
                            selectedFocusZone === zone.key ? 'text-surface' : 'text-secondary-700'
                          }`}>
                            {zone.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Duration */}
                  <View className="mb-4">
                    <Text className="text-secondary-700 font-medium mb-2">Durée (jours)</Text>
                    <View className="flex-row flex-wrap">
                      {[7, 14, 21, 28].map((duration) => (
                        <TouchableOpacity
                          key={duration}
                          onPress={() => setSelectedDuration(duration)}
                          className={`mr-2 mb-2 px-4 py-2 rounded-lg ${
                            selectedDuration === duration ? 'bg-primary-500' : 'bg-secondary-100'
                          }`}
                        >
                          <Text className={`font-medium ${
                            selectedDuration === duration ? 'text-surface' : 'text-secondary-700'
                          }`}>
                            {duration} j
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Generate Button */}
                  <TouchableOpacity
                    onPress={handleGeneratePreset}
                    disabled={generatingPreset}
                    className={`py-3 rounded-lg ${
                      generatingPreset ? 'bg-secondary-300' : 'bg-accent-500'
                    }`}
                  >
                    {generatingPreset ? (
                      <View className="flex-row justify-center items-center">
                        <ActivityIndicator size="small" color="#ffffff" />
                        <Text className="text-surface font-bold ml-2">Génération en cours...</Text>
                      </View>
                    ) : (
                      <Text className="text-surface font-bold text-center">
                        🎯 Générer un programme intelligent
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Preset Programs */}
          <View>
            <Text className="text-lg font-bold text-brand-text mb-3">Programmes préconfigurés classiques</Text>
            {presets.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => onPick(p)}
                className="bg-surface rounded-xl p-4 mb-3 border border-border-light"
              >
                <Text className="text-brand-text font-bold mb-1">{p.title}</Text>
                {p.goal ? <Text className="text-secondary-600 text-sm mb-1">{p.goal}</Text> : null}
                {p.phase ? (
                  <View className="bg-primary-50 self-start px-2 py-1 rounded">
                    <Text className="text-primary-700 text-xs">
                      Phase: {p.phase === 'menstrual' ? 'Menstruelle' : p.phase === 'follicular' ? 'Folliculaire' : p.phase === 'ovulation' ? 'Ovulation' : 'Lutéale'}
                    </Text>
                  </View>
                ) : null}
                <Text className="text-secondary-600 text-xs mt-2">{p.exercises.length} exercices</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View className="px-6 py-4 border-t border-border bg-surface">
          <TouchableOpacity onPress={onClose} className="bg-secondary-200 py-3 rounded-lg">
            <Text className="text-secondary-700 font-bold text-center">Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PresetProgramsModal;


