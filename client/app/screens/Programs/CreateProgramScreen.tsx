import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCycleContext } from '../../context/CycleContext';
import { usePrograms } from '../../hooks/usePrograms';
import { programApi } from '../../services/api';

interface ProgramType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface TrainingDay {
  id: string;
  name: string;
  shortName: string;
  value: number;
}

const CreateProgramScreen = () => {
  const navigation = useNavigation();
  const { currentCycle, getPhaseApiKey } = useCycleContext();
  const { generateProgram } = usePrograms();
  
  const [programTitle, setProgramTitle] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [duration, setDuration] = useState<string>('4');
  const [focusZone, setFocusZone] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch program types from API
  const [programTypes, setProgramTypes] = useState<ProgramType[]>([]);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);

  useEffect(() => {
    fetchProgramTypes();
    fetchTrainingDays();
  }, []);

  const fetchProgramTypes = async () => {
    try {
      const response = await programApi.getProgramTypes();
      setProgramTypes(response.types || []);
    } catch (err: any) {
      console.error('Error fetching program types:', err);
      // Fallback to default types if API fails
      setProgramTypes([
        { 
          id: 'strength', 
          name: 'Musculation', 
          icon: '💪', 
          color: 'bg-primary-100 border-primary-200',
          description: 'Renforcement musculaire et prise de force'
        },
        { 
          id: 'cardio', 
          name: 'Cardio', 
          icon: '💓', 
          color: 'bg-accent-100 border-accent-200',
          description: 'Endurance cardiovasculaire et brûlage de calories'
        },
        { 
          id: 'flexibility', 
          name: 'Flexibilité', 
          icon: '🧘‍♀️', 
          color: 'bg-primary-200 border-primary-300',
          description: 'Étirements, yoga et mobilité articulaire'
        },
        { 
          id: 'mixed', 
          name: 'Mixte', 
          icon: '⚡', 
          color: 'bg-accent-200 border-accent-300',
          description: 'Combinaison équilibrée de différents types d\'entraînement'
        },
      ]);
    }
  };

  const fetchTrainingDays = async () => {
    try {
      const response = await programApi.getTrainingDays();
      setTrainingDays(response.days || []);
    } catch (err: any) {
      console.error('Error fetching training days:', err);
      // Fallback to default days if API fails
      setTrainingDays([
        { id: 'monday', name: 'Lundi', shortName: 'L', value: 1 },
        { id: 'tuesday', name: 'Mardi', shortName: 'M', value: 2 },
        { id: 'wednesday', name: 'Mercredi', shortName: 'M', value: 3 },
        { id: 'thursday', name: 'Jeudi', shortName: 'J', value: 4 },
        { id: 'friday', name: 'Vendredi', shortName: 'V', value: 5 },
        { id: 'saturday', name: 'Samedi', shortName: 'S', value: 6 },
        { id: 'sunday', name: 'Dimanche', shortName: 'D', value: 0 },
      ]);
    }
  };

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const isDaySelected = (dayValue: number): boolean => selectedDays.includes(dayValue);

  const handleCreateProgram = async () => {
    if (!programTitle.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un titre pour votre programme');
      return;
    }

    if (!selectedType) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type d\'entraînement');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un jour d\'entraînement');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await programApi.createProgram({
        title: programTitle,
        type: selectedType,
        trainingDays: selectedDays,
        startDate: new Date().toISOString(),
        duration: parseInt(duration),
        focusZone,
        cyclePhase: getPhaseApiKey() || null
      });

      Alert.alert(
        'Programme créé !',
        'Votre programme a été créé avec succès.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du programme');
      Alert.alert('Erreur', 'Impossible de créer le programme. Veuillez réessayer.');
      console.error('Error creating program:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProgram = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await generateProgram({
        duration: parseInt(duration),
        focusZone: focusZone || undefined,
        sessionType: selectedType as 'cardio' | 'strength' | 'flexibility' | 'mixed',
      });

      if (response) {
        Alert.alert(
          'Programme généré !',
          'Un programme personnalisé a été généré pour vous.',
          [
            {
              text: 'Voir le programme',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du programme');
      Alert.alert('Erreur', 'Impossible de générer le programme. Veuillez réessayer.');
      console.error('Error generating program:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !programTypes.length) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5A3C" />
          <Text className="text-brand-text mt-4">Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#8B5A3C" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-brand-text">Nouveau Programme</Text>
          </View>
          <Text className="text-base text-secondary-600">
            Créez un programme adapté à votre cycle et vos objectifs
          </Text>
        </View>

        {/* Current Phase Info */}
        {currentCycle && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border-light">
            <View className="flex-row items-center">
              <View className="bg-primary-100 rounded-full w-10 h-10 items-center justify-center mr-3">
                <Text className="text-primary-700 text-lg">
                  {currentCycle.isPeriodDay ? '🩸' : 
                   currentCycle.cycleDay <= Math.ceil(currentCycle.cycleLength / 2) ? '💪' :
                   currentCycle.isOvulationPhase ? '⚡' : '🧘'}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-secondary-600 mb-1">Phase actuelle</Text>
                <Text className="text-lg font-bold text-brand-text">
                  {currentCycle.isPeriodDay ? 'Menstruelle' : 
                   currentCycle.cycleDay <= Math.ceil(currentCycle.cycleLength / 2) ? 'Folliculaire' :
                   currentCycle.isOvulationPhase ? 'Ovulatoire' : 'Lutéale'}
                </Text>
                <Text className="text-xs text-secondary-500">
                  Jour {currentCycle.cycleDay} de votre cycle
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Program Title */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Titre du programme</Text>
          <TextInput
            className="bg-surface border border-border p-4 rounded-xl text-lg text-brand-text"
            placeholder="Mon programme personnalisé"
            placeholderTextColor="#A99985"
            value={programTitle}
            onChangeText={setProgramTitle}
          />
        </View>

        {/* Program Type */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Type d'entraînement</Text>
          <View className="space-y-3">
            {programTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedType(type.id)}
                className={`border rounded-xl p-4 ${
                  selectedType === type.id 
                    ? 'bg-primary-50 border-primary-500' 
                    : 'bg-surface border-border'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{type.icon}</Text>
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${
                      selectedType === type.id ? 'text-primary-700' : 'text-brand-text'
                    }`}>
                      {type.name}
                    </Text>
                    <Text className={`text-sm ${
                      selectedType === type.id ? 'text-primary-600' : 'text-secondary-600'
                    }`}>
                      {type.description}
                    </Text>
                  </View>
                  {selectedType === type.id && (
                    <View className="bg-primary-500 rounded-full w-6 h-6 items-center justify-center">
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration and Focus Zone */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Paramètres</Text>
          
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-secondary-600 mb-2">Durée (en semaines)</Text>
              <TextInput
                className="bg-surface border border-border p-3 rounded-xl text-brand-text"
                placeholder="4"
                placeholderTextColor="#A99985"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
              />
            </View>
            
            <View>
              <Text className="text-sm font-medium text-secondary-600 mb-2">Zone de focus (optionnel)</Text>
              <TextInput
                className="bg-surface border border-border p-3 rounded-xl text-brand-text"
                placeholder="Ex: Jambes, Haut du corps, Core..."
                placeholderTextColor="#A99985"
                value={focusZone}
                onChangeText={setFocusZone}
              />
            </View>
          </View>
        </View>

        {/* Training Days */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">
            Jours d'entraînement ({selectedDays.length} sélectionnés)
          </Text>
          <View className="space-y-3">
            {trainingDays.map((day) => (
              <TouchableOpacity
                key={day.id}
                onPress={() => toggleDay(day.value)}
                className={`border rounded-xl p-4 flex-row items-center justify-between ${
                  isDaySelected(day.value) 
                    ? 'bg-primary-50 border-primary-500' 
                    : 'bg-surface border-border'
                }`}
              >
                <View>
                  <Text className={`text-lg font-semibold ${
                    isDaySelected(day.value) ? 'text-primary-700' : 'text-brand-text'
                  }`}>
                    {day.name}
                  </Text>
                  <Text className={`text-sm ${
                    isDaySelected(day.value) ? 'text-primary-600' : 'text-secondary-600'
                  }`}>
                    {isDaySelected(day.value) ? 'Séance prévue' : 'Jour de repos'}
                  </Text>
                </View>
                {isDaySelected(day.value) && (
                  <View className="bg-primary-500 rounded-full w-8 h-8 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Program Summary */}
        {(programTitle || selectedType || selectedDays.length > 0) && (
          <View className="bg-surface rounded-xl p-4 mb-6 border border-border-light">
            <Text className="text-lg font-semibold text-brand-text mb-3">Résumé</Text>
            <View className="space-y-2">
              <View className="flex-row">
                <Text className="text-secondary-600 w-20">Titre:</Text>
                <Text className="text-brand-text font-medium flex-1">
                  {programTitle || 'Non défini'}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-secondary-600 w-20">Type:</Text>
                <Text className="text-brand-text font-medium flex-1">
                  {programTypes.find(t => t.id === selectedType)?.name || 'Non sélectionné'}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-secondary-600 w-20">Durée:</Text>
                <Text className="text-brand-text font-medium flex-1">
                  {duration} semaine{parseInt(duration) > 1 ? 's' : ''}
                </Text>
              </View>
              <View className="flex-row">
                <Text className="text-secondary-600 w-20">Jours:</Text>
                <Text className="text-brand-text font-medium flex-1">
                  {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''}/semaine
                </Text>
              </View>
              {focusZone && (
                <View className="flex-row">
                  <Text className="text-secondary-600 w-20">Focus:</Text>
                  <Text className="text-brand-text font-medium flex-1">{focusZone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="mb-8 space-y-3">
          <TouchableOpacity 
            onPress={handleCreateProgram}
            disabled={!programTitle || !selectedType || selectedDays.length === 0 || loading}
            className={`py-4 rounded-xl items-center ${
              programTitle && selectedType && selectedDays.length > 0
                ? 'bg-primary-500 active:bg-primary-600' 
                : 'bg-gray-300'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`text-lg font-bold ${
                programTitle && selectedType && selectedDays.length > 0 ? 'text-surface' : 'text-gray-500'
              }`}>
                Créer le programme
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleGenerateProgram}
            disabled={!selectedType || loading}
            className={`py-4 rounded-xl items-center ${
              selectedType ? 'bg-accent-500 active:bg-accent-600' : 'bg-gray-300'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className={`text-lg font-bold ${
                selectedType ? 'text-surface' : 'text-gray-500'
              }`}>
                🎯 Générer un programme IA
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Coming Soon Section */}
        <View className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#8B5A3C" />
            <View className="flex-1 ml-3">
              <Text className="text-primary-800 font-medium mb-1">Fonctionnalités à venir</Text>
              <Text className="text-primary-700 text-sm">
                • Création d'exercices personnalisés{'\n'}
                • Modèles de programmes prédéfinis{'\n'}
                • Suivi des performances{'\n'}
                • Partage de programmes
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateProgramScreen; 

