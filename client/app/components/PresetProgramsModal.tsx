import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';

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
}

const PresetProgramsModal: React.FC<PresetProgramsModalProps> = ({ visible, onClose, presets, onPick }) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-brand-background">
        <View className="px-6 pt-12 pb-4 border-b border-border bg-surface">
          <Text className="text-2xl font-bold text-brand-text">Programmes préconfigurés</Text>
          <Text className="text-secondary-600 mt-1">Sélectionnez un programme adapté à votre phase</Text>
        </View>
        <ScrollView className="flex-1 px-6 py-4">
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


