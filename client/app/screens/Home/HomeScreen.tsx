import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useStreak } from '../../hooks/useStreak';
import { usePrograms } from '../../hooks/usePrograms';
import { Ionicons } from '@expo/vector-icons';
import CycleTrackingScreen from '../Cycle/CycleTrackingScreen';
import PeriodLoggingScreen from '../Cycle/PeriodLoggingScreen';

interface HomeScreenProps {
  navigation: NavigationProp<any, any>;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const { currentPhase, cycleConfig, getPhaseLabel, getPhaseEmoji, getPhaseColor } = useCycle();
  const { streakData, logWorkout } = useStreak();
  const { activeProgram } = usePrograms();
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showPeriodLogging, setShowPeriodLogging] = useState(false);

  // Dynamic cycle phases based on current phase
  const cyclePhases = [
    { 
      name: 'Menstruelle', 
      phase: 'MENSTRUAL',
      current: currentPhase?.phase === 'MENSTRUAL',
      color: currentPhase?.phase === 'MENSTRUAL' ? 'bg-phase-menstrual-500' : 'bg-border'
    },
    { 
      name: 'Folliculaire', 
      phase: 'FOLLICULAR',
      current: currentPhase?.phase === 'FOLLICULAR',
      color: currentPhase?.phase === 'FOLLICULAR' ? 'bg-phase-follicular-500' : 'bg-border'
    },
    { 
      name: 'Ovulatoire', 
      phase: 'OVULATION',
      current: currentPhase?.phase === 'OVULATION',
      color: currentPhase?.phase === 'OVULATION' ? 'bg-phase-ovulation-500' : 'bg-border'
    },
    { 
      name: 'Lutéale', 
      phase: 'LUTEAL',
      current: currentPhase?.phase === 'LUTEAL',
      color: currentPhase?.phase === 'LUTEAL' ? 'bg-phase-luteal-500' : 'bg-border'
    },
  ];

  const handleStartWorkout = async () => {
    // Log the workout for streak tracking
    await logWorkout();
    navigation.navigate('WorkoutSession');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView className="flex-1 px-6">
        {/* Header with proper spacing */}
        <View className="pt-16 pb-6">
          <Text className="text-lg text-secondary-600 mb-1">Bonjour !</Text>
          <Text className="text-3xl font-bold text-brand-text mb-6">Prête pour aujourd'hui ?</Text>
          
          {/* Streak Badge */}
          <View className="bg-surface rounded-xl p-4 mb-4 shadow-sm border border-border-light">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-secondary-600 mb-1">Série en cours</Text>
                <Text className="text-2xl font-bold text-brand-text">{streakData.currentStreak} jour{streakData.currentStreak > 1 ? 's' : ''}</Text>
                {streakData.longestStreak > streakData.currentStreak && (
                  <Text className="text-xs text-secondary-500">Record: {streakData.longestStreak} jours</Text>
                )}
              </View>
              <View className="items-center">
                <Text className="text-4xl">🔥</Text>
                {streakData.currentStreak > 0 && (
                  <Text className="text-xs text-secondary-600 mt-1">
                    {streakData.thisWeekWorkouts} cette semaine
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Current Phase Card - Lively Style */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Phase actuelle</Text>
          <TouchableOpacity 
            className="bg-surface rounded-xl p-6 shadow-sm border border-border-light active:bg-surface-secondary"
            onPress={() => setShowCycleModal(true)}
          >
            {user?.isMenopausal ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">Post-ménopause</Text>
                  <Text className="text-sm text-secondary-600">Entraînements adaptés à votre situation</Text>
                </View>
                <View className="bg-secondary-500 rounded-full w-16 h-16 items-center justify-center">
                  <Text className="text-surface text-2xl">🌙</Text>
                </View>
              </View>
            ) : currentPhase ? (
              <View>
                {/* Main Phase Info */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-brand-text mb-1">{getPhaseLabel(currentPhase.phase)}</Text>
                    <Text className="text-sm text-secondary-600 mb-1">Jour {currentPhase.cycleDay} de {currentPhase.cycleLength}</Text>
                    {currentPhase.daysUntilNextPhase > 0 && (
                      <Text className="text-xs text-secondary-500">
                        {currentPhase.daysUntilNextPhase} jour{currentPhase.daysUntilNextPhase > 1 ? 's' : ''} restant{currentPhase.daysUntilNextPhase > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  <View className={`${getPhaseColor(currentPhase.phase)} rounded-full w-16 h-16 items-center justify-center`}>
                    <Text className="text-brand-text text-2xl">{getPhaseEmoji(currentPhase.phase)}</Text>
                  </View>
                </View>

                {/* Lively-style Progress Ring */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-brand-text">Progression du cycle</Text>
                    <Text className="text-sm text-secondary-600">
                      {Math.round((currentPhase.cycleDay / currentPhase.cycleLength) * 100)}%
                    </Text>
                  </View>
                  
                  {/* Progress bar with phase colors */}
                  <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <View 
                      className={`h-full ${getPhaseColor(currentPhase.phase)}`}
                      style={{ width: `${(currentPhase.cycleDay / currentPhase.cycleLength) * 100}%` }}
                    />
                  </View>
                  
                  {/* Phase markers */}
                  <View className="flex-row justify-between mt-2">
                    {cyclePhases.map((phase, index) => (
                      <View key={phase.name} className="items-center">
                        <View 
                          className={`w-2 h-2 rounded-full mb-1 ${
                            phase.current ? phase.color : 'bg-gray-300'
                          }`} 
                        />
                        <Text className={`text-xs ${
                          phase.current ? 'text-brand-text font-medium' : 'text-secondary-500'
                        }`}>
                          {phase.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-lg font-bold text-primary-500">
                      {currentPhase.phase === 'MENSTRUAL' ? '💤' : 
                       currentPhase.phase === 'FOLLICULAR' ? '💪' :
                       currentPhase.phase === 'OVULATION' ? '⚡' : '🧘'}
                    </Text>
                    <Text className="text-xs text-secondary-600">
                      {currentPhase.phase === 'MENSTRUAL' ? 'Repos' : 
                       currentPhase.phase === 'FOLLICULAR' ? 'Force' :
                       currentPhase.phase === 'OVULATION' ? 'Performance' : 'Récupération'}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-accent-500">
                      {currentPhase.phase === 'MENSTRUAL' ? '🩸' : 
                       currentPhase.phase === 'FOLLICULAR' ? '🌱' :
                       currentPhase.phase === 'OVULATION' ? '🌻' : '🍂'}
                    </Text>
                    <Text className="text-xs text-secondary-600">Phase</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-success-500">
                      {currentPhase.daysUntilNextPhase}
                    </Text>
                    <Text className="text-xs text-secondary-600">Jours restants</Text>
                  </View>
                </View>

                {/* Quick Actions */}
                <View className="mt-4 pt-3 border-t border-border-light">
                  <View className="flex-row items-center justify-center mb-3">
                    <Text className="text-xs text-secondary-500 mr-1">Voir plus de détails</Text>
                    <Ionicons name="chevron-forward" size={12} color="#A99985" />
                  </View>
                  
                  {/* Quick Period Logging Button */}
                  {currentPhase.phase === 'MENSTRUAL' && (
                    <TouchableOpacity
                      onPress={() => setShowPeriodLogging(true)}
                      className="bg-pink-100 py-2 px-4 rounded-lg flex-row items-center justify-center"
                    >
                      <Ionicons name="add-circle" size={16} color="#E91E63" />
                      <Text className="text-pink-700 font-medium text-sm ml-2">Enregistrer mes règles</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">Cycle non suivi</Text>
                  <Text className="text-sm text-secondary-600">Activez le suivi pour des recommandations personnalisées</Text>
                </View>
                <View className="bg-secondary-300 rounded-full w-16 h-16 items-center justify-center">
                  <Text className="text-surface text-2xl">📅</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Next Workout */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Prochain entraînement</Text>
          <TouchableOpacity 
            className="bg-primary-500 rounded-xl p-6 shadow-sm active:bg-primary-600"
            onPress={handleStartWorkout}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-surface text-xl font-bold mb-2">
                  {activeProgram ? activeProgram.title : 'Entraînement adapté'}
                </Text>
                <Text className="text-primary-100 text-sm">
                  {user?.isMenopausal 
                    ? 'Adapté à votre situation post-ménopause'
                    : currentPhase 
                      ? `Adapté à votre phase ${getPhaseLabel(currentPhase.phase).toLowerCase()}`
                      : cycleConfig?.isCycleTrackingEnabled === false
                        ? 'Entraînement général recommandé'
                        : 'Configurez votre cycle pour des recommandations personnalisées'
                  }
                </Text>
                {activeProgram && (
                  <Text className="text-primary-200 text-xs mt-1">
                    {activeProgram.exerciseCount} exercices • Programme actif
                  </Text>
                )}
              </View>
              <View className="bg-surface/20 rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-surface text-xl">▶️</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cycle Tracking Modal */}
      <Modal
        visible={showCycleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCycleModal(false)}
      >
        <View className="flex-1">
          <CycleTrackingScreen onClose={() => setShowCycleModal(false)} />
        </View>
      </Modal>

      {/* Period Logging Modal */}
      <Modal
        visible={showPeriodLogging}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPeriodLogging(false)}
      >
        <PeriodLoggingScreen onClose={() => setShowPeriodLogging(false)} />
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen; 
