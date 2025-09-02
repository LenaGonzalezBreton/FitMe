import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { programApi } from '../services/api';

interface Program {
  id: string;
  title: string;
  isActive: boolean;
  exerciseCount: number;
}

interface ProgramPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (programId: string) => void;
}

const ProgramPickerModal: React.FC<ProgramPickerModalProps> = ({ visible, onClose, onSelect }) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const res = await programApi.getUserPrograms({ limit: 50 });
      setPrograms(res.programs || []);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Chargement des programmes impossible');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) loadPrograms();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-brand-background">
        <View className="px-6 pt-12 pb-4 border-b border-border bg-surface">
          <Text className="text-2xl font-bold text-brand-text">Choisir un programme</Text>
        </View>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView className="flex-1 px-6 py-4">
            {programs.length === 0 ? (
              <View className="bg-surface rounded-xl p-6 items-center border border-border-light">
                <Text className="text-4xl mb-3">📦</Text>
                <Text className="text-brand-text">Aucun programme</Text>
              </View>
            ) : (
              <View>
                {programs.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => onSelect(p.id)}
                    className="bg-surface rounded-xl p-4 mb-3 border border-border-light"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-brand-text font-bold" numberOfLines={1}>{p.title}</Text>
                        <Text className="text-secondary-600 text-xs">{p.exerciseCount} exercices</Text>
                      </View>
                      <View className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-success-500' : 'bg-border'}`} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
        <View className="px-6 py-4 border-t border-border bg-surface">
          <TouchableOpacity onPress={onClose} className="bg-secondary-200 py-3 rounded-lg">
            <Text className="text-secondary-700 font-bold text-center">Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProgramPickerModal;


