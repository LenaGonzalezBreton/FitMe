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
  const { currentCycle, cycleConfig, getCycleCharacteristics, getCycleEmoji, getCycleColor } = useCycle();
  const { streakData, logWorkout } = useStreak();
  const { activeProgram } = usePrograms();
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showPeriodLogging, setShowPeriodLogging] = useState(false);

  // Dynamic cycle characteristics based on current cycle
  const midPoint = currentCycle ? Math.ceil(currentCycle.cycleLength / 2) : 14;
  const cycleCharacteristics = [
    { 
      name: 'Menstruelle', 
      characteristics: 'period_day',
      current: currentCycle?.isPeriodDay,
      color: currentCycle?.isPeriodDay ? 'bg-phase-menstrual-500' : 'bg-border'
    },
    { 
      name: 'Post-règles', 
      characteristics: 'post_period_phase',
      current: currentCycle && !currentCycle.isPeriodDay && currentCycle.cycleDay <= midPoint,
      color: currentCycle && !currentCycle.isPeriodDay && currentCycle.cycleDay <= midPoint ? 'bg-phase-follicular-500' : 'bg-border'
    },
    { 
      name: 'Ovulatoire', 
      characteristics: 'ovulation_phase',
      current: currentCycle?.isOvulationPhase,
      color: currentCycle?.isOvulationPhase ? 'bg-phase-ovulation-500' : 'bg-border'
    },
    { 
      name: 'Post-ovulation', 
      characteristics: 'post_ovulation_phase',
      current: currentCycle && !currentCycle.isPeriodDay && !currentCycle.isOvulationPhase && currentCycle.cycleDay > midPoint,
      color: currentCycle && !currentCycle.isPeriodDay && !currentCycle.isOvulationPhase && currentCycle.cycleDay > midPoint ? 'bg-phase-luteal-500' : 'bg-border'
    },
  ];

  const handleStartWorkout = async () => {
    // Log the workout for streak tracking
    await logWorkout();
    navigation.navigate('WorkoutSession');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 24 }}>
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

        {/* Current Cycle Card - Lively Style */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Cycle actuel</Text>
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
            ) : currentCycle ? (
              <View>
                {/* Main Cycle Info */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-brand-text mb-1">
                      {getCycleCharacteristics(currentCycle.cycleDay, currentCycle.isPeriodDay, currentCycle.isOvulationPhase, currentCycle.isFertileDay)}
                    </Text>
                    <Text className="text-sm text-secondary-600 mb-1">Jour {currentCycle.cycleDay} de {currentCycle.cycleLength}</Text>
                    {currentCycle.daysUntilNextCycle > 0 && (
                      <Text className="text-xs text-secondary-500">
                        {currentCycle.daysUntilNextCycle} jour{currentCycle.daysUntilNextCycle > 1 ? 's' : ''} restant{currentCycle.daysUntilNextCycle > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  <View className={`${getCycleColor(currentCycle.cycleDay, currentCycle.isPeriodDay, currentCycle.isOvulationPhase, currentCycle.isFertileDay)} rounded-full w-16 h-16 items-center justify-center`}>
                    <Text className="text-brand-text text-2xl">{getCycleEmoji(currentCycle.cycleDay, currentCycle.isPeriodDay, currentCycle.isOvulationPhase, currentCycle.isFertileDay)}</Text>
                  </View>
                </View>

                {/* Lively-style Progress Ring */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-brand-text">Progression du cycle</Text>
                    <Text className="text-sm text-secondary-600">
                      {Math.round((currentCycle.cycleDay / currentCycle.cycleLength) * 100)}%
                    </Text>
                  </View>
                  
                  {/* Progress bar with cycle colors (thicker for better touch targets) */}
                  <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <View 
                      className={`h-full ${getCycleColor(currentCycle.cycleDay, currentCycle.isPeriodDay, currentCycle.isOvulationPhase, currentCycle.isFertileDay)}`}
                      style={{ width: `${(currentCycle.cycleDay / currentCycle.cycleLength) * 100}%` }}
                    />
                  </View>
                  
                  {/* Cycle characteristics markers */}
                  <View className="flex-row justify-between mt-2">
                    {cycleCharacteristics.map((characteristic, index) => (
                      <View key={characteristic.name} className="items-center">
                        <View 
                          className={`w-2 h-2 rounded-full mb-1 ${
                            characteristic.current ? characteristic.color : 'bg-gray-300'
                          }`} 
                        />
                        <Text className={`text-xs ${
                          characteristic.current ? 'text-brand-text font-medium' : 'text-secondary-500'
                        }`}>
                          {characteristic.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-lg font-bold text-primary-500">
                      {currentCycle.isPeriodDay ? '💤' : 
                       currentCycle.cycleDay <= 14 ? '💪' :
                       currentCycle.isOvulationPhase ? '⚡' : '🧘'}
                    </Text>
                    <Text className="text-xs text-secondary-600">
                      {currentCycle.isPeriodDay ? 'Repos' : 
                       currentCycle.cycleDay <= 14 ? 'Force' :
                       currentCycle.isOvulationPhase ? 'Performance' : 'Récupération'}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-accent-500">
                      {currentCycle.isPeriodDay ? '🩸' : 
                       currentCycle.cycleDay <= 14 ? '🌱' :
                       currentCycle.isOvulationPhase ? '🌻' : '🍂'}
                    </Text>
                    <Text className="text-xs text-secondary-600">Caractéristiques</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-success-500">
                      {currentCycle.daysUntilNextCycle}
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
                  {currentCycle.isPeriodDay && (
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
                    : currentCycle 
                      ? `Adapté à votre cycle (jour ${currentCycle.cycleDay})`
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
