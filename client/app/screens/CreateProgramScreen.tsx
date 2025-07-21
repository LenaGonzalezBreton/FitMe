import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const DAYS: string[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface ProgramType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const PROGRAM_TYPES: ProgramType[] = [
  { id: 'strength', name: 'Musculation', icon: '💪', color: 'bg-primary-100 border-primary-200' },
  { id: 'cardio', name: 'Cardio', icon: '💓', color: 'bg-accent-100 border-accent-200' },
  { id: 'flexibility', name: 'Flexibilité', icon: '🧘‍♀️', color: 'bg-primary-200 border-primary-300' },
  { id: 'mixed', name: 'Mixte', icon: '⚡', color: 'bg-accent-200 border-accent-300' },
];

const CreateProgramScreen = () => {
  const [programTitle, setProgramTitle] = useState('');
  const [selectedType, setSelectedType] = useState('mixed');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [currentPhase] = useState<string>('Folliculaire');

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const isDaySelected = (day: string): boolean => selectedDays.includes(day);

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-16 pb-6">
          <Text className="text-3xl font-bold text-brand-dark-bg mb-2">Nouveau Programme</Text>
          <Text className="text-base text-brand-dark-surface">
            Créez un programme adapté à votre cycle
          </Text>
        </View>

        {/* Current Phase Info */}
        <View className="bg-white rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <View className="bg-brand-beige rounded-full w-10 h-10 items-center justify-center mr-3">
              <Text className="text-brand-brown text-lg">💪</Text>
            </View>
            <View>
              <Text className="text-sm text-primary-200 mb-1">Phase actuelle</Text>
              <Text className="text-lg font-bold text-brand-dark-bg">{currentPhase}</Text>
            </View>
          </View>
        </View>

        {/* Program Title */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-3">Titre du programme</Text>
          <TextInput
            className="bg-white border border-brand-dark-secondary p-4 rounded-xl text-lg text-brand-dark-bg"
            placeholder="Mon super programme"
            placeholderTextColor="#8E8E93"
            value={programTitle}
            onChangeText={setProgramTitle}
          />
        </View>

        {/* Program Type */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-3">Type d'entraînement</Text>
          <View className="space-y-3">
            {PROGRAM_TYPES.map((type: ProgramType) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`border rounded-xl p-4 flex-row items-center ${
                  selectedType === type.id 
                    ? 'bg-brand-beige border-brand-dark-secondary'
                      : 'bg-white border-brand-dark-secondary'
                }`}
              >
                <Text className="text-2xl mr-3">{type.icon}</Text>
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${
                    selectedType === type.id ? 'text-brand-dark-bg' : 'text-brand-dark-bg'
                  }`}>
                    {type.name}
                  </Text>
                </View>
                {selectedType === type.id && (
                  <View className="bg-primary-500 rounded-full w-6 h-6 items-center justify-center">
                    <Text className="text-brand-dark-bg text-sm">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Training Days */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-dark-bg mb-3">
            Jours d'entraînement ({selectedDays.length} sélectionnés)
          </Text>
          <View className="space-y-3">
            {DAYS.map((day: string) => (
              <TouchableOpacity
                key={day}
                onPress={() => toggleDay(day)}
                className={`border rounded-xl p-4 flex-row items-center justify-between ${
                  isDaySelected(day) 
                    ? 'bg-brand-beige border-brand-dark-secondary' 
                    : 'bg-white border-brand-dark-secondary'
                }`}
              >
                <View>
                  <Text className={`text-lg font-semibold ${
                    isDaySelected(day) ? 'text-brand-dark-bg' : 'text-brand-dark-bg'
                  }`}>
                    {day}
                  </Text>
                  <Text className={`text-sm ${
                    isDaySelected(day) ? 'text-primary-200' : 'text-brand-dark-secondary'
                  }`}>
                    {isDaySelected(day) ? 'Séance prévue' : 'Jour de repos'}
                  </Text>
                </View>
                {isDaySelected(day) && (
                  <View className="bg-primary-500 rounded-full w-8 h-8 items-center justify-center">
                    <Text className="text-brand-dark-bg text-sm">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Program Summary */}
        {(programTitle || selectedDays.length > 0) && (
          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className="text-lg font-semibold text-brand-dark-bg mb-3">Résumé</Text>
            <View className="space-y-2">
              <View className="flex-row">
                <Text className="text-brand-dark-secondary w-20">Titre:</Text>
                <Text className="text-brand-dark-bg font-medium flex-1">
                  {programTitle || 'Non défini'}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-brand-dark-secondary w-20">Type:</Text>
                <Text className="text-brand-dark-bg font-medium flex-1">
                  {PROGRAM_TYPES.find(t => t.id === selectedType)?.name}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-brand-dark-secondary w-20">Jours:</Text>
                <Text className="text-brand-dark-bg font-medium flex-1">
                  {selectedDays.length} jours/semaine
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-brand-dark-secondary w-20">Phase:</Text>
                <Text className="text-brand-brown font-medium flex-1">{currentPhase}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mb-8 space-y-3">
          <TouchableOpacity 
            className={`p-4 rounded-xl items-center ${
              programTitle && selectedType 
                ? 'bg-brand-beige' 
                : 'bg-brand-dark-gray-btn'
            }`}
            disabled={!programTitle || !selectedType}
          >
            <Text className={`text-lg font-bold ${
              programTitle && selectedType ? 'text-brand-dark-bg' : 'text-brand-dark-secondary'
            }`}>
              Créer le programme
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="bg-white border border-brand-dark-secondary p-4 rounded-xl items-center">
            <Text className="text-brand-dark-bg text-lg font-medium">
              + Ajouter des exercices
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProgramScreen; 
