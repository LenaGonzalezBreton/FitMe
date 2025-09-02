import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal, Animated } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCycleContext } from '../../context/CycleContext';
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
  const { currentCycle, cycleConfig, loading, getCycleCharacteristics, getCycleEmoji, getCycleColor } = useCycleContext();
  const { streakData, logWorkout } = useStreak();
  const { activeProgram } = usePrograms();
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showPeriodLogging, setShowPeriodLogging] = useState(false);

  // Animation pour le loader
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  // Animation du loader
  useEffect(() => {
    if (loading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );

      const fadeAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );

      pulseAnimation.start();
      fadeAnimation.start();

      return () => {
        pulseAnimation.stop();
        fadeAnimation.stop();
      };
    }
  }, [loading, pulseAnim, fadeAnim]);

  // Dynamic cycle characteristics based on current cycle
  const cycleCharacteristics = [
    { 
      name: 'Menstruelle', 
      characteristics: 'period_day',
      current: currentCycle?.isPeriodDay,
      color: currentCycle?.isPeriodDay ? 'bg-phase-menstrual-500' : 'bg-border'
    },
    { 
      name: 'Folliculaire', 
      characteristics: 'follicular_phase',
      current: currentCycle && !currentCycle.isPeriodDay && !currentCycle.isOvulationPhase && !currentCycle.isFertileDay && currentCycle.cycleDay <= 14,
      color: currentCycle && !currentCycle.isPeriodDay && !currentCycle.isOvulationPhase && !currentCycle.isFertileDay && currentCycle.cycleDay <= 14 ? 'bg-phase-follicular-500' : 'bg-border'
    },
    { 
      name: 'Ovulatoire', 
      characteristics: 'ovulation_phase',
      current: currentCycle?.isOvulationPhase,
      color: currentCycle?.isOvulationPhase ? 'bg-phase-ovulation-500' : 'bg-border'
    },
    { 
      name: 'Lutéale', 
      characteristics: 'luteal_phase',
      current: currentCycle && !currentCycle.isPeriodDay && !currentCycle.isOvulationPhase && currentCycle.cycleDay > 14,
      color: currentCycle && !currentCycle.isPeriodDay && !currentCycle.isOvulationPhase && currentCycle.cycleDay > 14 ? 'bg-phase-luteal-500' : 'bg-border'
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
          <Text className="mb-1 text-lg text-secondary-600">Bonjour !</Text>
          <Text className="mb-6 text-3xl font-bold text-brand-text">Prête pour aujourd'hui ?</Text>
          
          {/* Streak Badge */}
          <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="mb-1 text-sm text-secondary-600">Série en cours</Text>
                <Text className="text-2xl font-bold text-brand-text">{streakData.currentStreak} jour{streakData.currentStreak > 1 ? 's' : ''}</Text>
                {streakData.longestStreak > streakData.currentStreak && (
                  <Text className="text-xs text-secondary-500">Record: {streakData.longestStreak} jours</Text>
                )}
              </View>
              <View className="items-center">
                <Text className="text-4xl">🔥</Text>
                {streakData.currentStreak > 0 && (
                  <Text className="mt-1 text-xs text-secondary-600">
                    {streakData.thisWeekWorkouts} cette semaine
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Current Cycle Card - Lively Style */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-brand-text">Cycle actuel</Text>
          <TouchableOpacity 
            className="p-6 rounded-xl border shadow-sm bg-surface border-border-light active:bg-surface-secondary"
            onPress={() => setShowCycleModal(true)}
          >
            {user?.isMenopausal ? (
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="mb-1 text-xl font-bold text-brand-text">Post-ménopause</Text>
                  <Text className="text-sm text-secondary-600">Entraînements adaptés à votre situation</Text>
                </View>
                <View className="justify-center items-center w-16 h-16 rounded-full bg-secondary-500">
                  <Text className="text-2xl text-surface">🌙</Text>
                </View>
              </View>
            ) : loading ? (
              <View className="relative">
                {/* Gradient background animé */}
                <Animated.View 
                  className="absolute inset-0 rounded-xl opacity-20"
                  style={{
                    opacity: fadeAnim,
                    backgroundColor: '#E3F2FD'
                  }}
                />
                
                <View className="flex-row justify-between items-center p-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Animated.View
                        className="mr-2 w-4 h-4 rounded-full bg-primary-500"
                        style={{
                          transform: [{ scale: pulseAnim }],
                          opacity: fadeAnim,
                        }}
                      />
                      <Text className="text-xl font-bold text-brand-text">Synchronisation</Text>
                    </View>
                    
                    <Animated.Text 
                      className="mb-2 text-sm text-secondary-600"
                      style={{ opacity: fadeAnim }}
                    >
                      Récupération de vos données de cycle personnalisées
                    </Animated.Text>
                    
                    {/* Barre de progression animée */}
                    <View className="overflow-hidden h-1 bg-gray-200 rounded-full">
                      <Animated.View 
                        className="h-full bg-gradient-to-r rounded-full from-primary-400 to-primary-600"
                        style={{
                          width: '60%',
                          opacity: fadeAnim,
                          transform: [{ scaleX: pulseAnim }],
                        }}
                      />
                    </View>
                  </View>
                  
                  <Animated.View 
                    className="ml-4"
                    style={{ 
                      transform: [{ rotate: '45deg' }, { scale: pulseAnim }],
                      opacity: fadeAnim,
                    }}
                  >
                    <View className="justify-center items-center w-16 h-16 bg-gradient-to-br rounded-full shadow-lg from-primary-400 to-primary-600">
                      <Animated.View style={{ transform: [{ rotate: '-45deg' }] }}>
                        <Text className="text-2xl text-white">🔄</Text>
                      </Animated.View>
                    </View>
                  </Animated.View>
                </View>
              </View>
            ) : currentCycle ? (
              <View>
                {/* Main Cycle Info */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-1">
                    <Text className="mb-1 text-2xl font-bold text-brand-text">
                      {getCycleCharacteristics(
                        currentCycle.cycleDay,
                        currentCycle.isPeriodDay,
                        currentCycle.isOvulationPhase,
                        currentCycle.isFertileDay,
                        currentCycle.cycleLength
                      )}
                    </Text>
                    <Text className="mb-1 text-sm text-secondary-600">Jour {currentCycle.cycleDay} de {currentCycle.cycleLength}</Text>
                    {currentCycle.daysUntilNextCycle > 0 && (
                      <Text className="text-xs text-secondary-500">
                        {currentCycle.daysUntilNextCycle} jour{currentCycle.daysUntilNextCycle > 1 ? 's' : ''} restant{currentCycle.daysUntilNextCycle > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  <View className={`${getCycleColor(
                    currentCycle.cycleDay,
                    currentCycle.isPeriodDay,
                    currentCycle.isOvulationPhase,
                    currentCycle.isFertileDay,
                    currentCycle.cycleLength
                  )} rounded-full w-16 h-16 items-center justify-center`}>
                    <Text className="text-2xl text-brand-text">{getCycleEmoji(
                      currentCycle.cycleDay,
                      currentCycle.isPeriodDay,
                      currentCycle.isOvulationPhase,
                      currentCycle.isFertileDay,
                      currentCycle.cycleLength
                    )}</Text>
                  </View>
                </View>

                {/* Lively-style Progress Ring */}
                <View className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-medium text-brand-text">Progression du cycle</Text>
                    <Text className="text-sm text-secondary-600">
                      {Math.round((currentCycle.cycleDay / currentCycle.cycleLength) * 100)}%
                    </Text>
                  </View>
                  
                  {/* Progress bar with cycle colors (thicker for better touch targets) */}
                  <View className="overflow-hidden h-4 bg-gray-200 rounded-full">
                    <View 
                      className={`h-full ${getCycleColor(currentCycle.cycleDay, currentCycle.isPeriodDay, currentCycle.isOvulationPhase, currentCycle.isFertileDay, currentCycle.cycleLength)}`}
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
                       currentCycle.cycleDay <= Math.ceil(currentCycle.cycleLength / 2) ? '💪' :
                       currentCycle.isOvulationPhase ? '⚡' : '🧘'}
                    </Text>
                    <Text className="text-xs text-secondary-600">
                      {currentCycle.isPeriodDay ? 'Repos' : 
                       currentCycle.cycleDay <= Math.ceil(currentCycle.cycleLength / 2) ? 'Force' :
                       currentCycle.isOvulationPhase ? 'Performance' : 'Récupération'}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-bold text-accent-500">
                      {currentCycle.isPeriodDay ? '🩸' : 
                       currentCycle.cycleDay <= Math.ceil(currentCycle.cycleLength / 2) ? '🌱' :
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
                <View className="pt-3 mt-4 border-t border-border-light">
                  <View className="flex-row justify-center items-center mb-3">
                    <Text className="mr-1 text-xs text-secondary-500">Voir plus de détails</Text>
                    <Ionicons name="chevron-forward" size={12} color="#A99985" />
                  </View>
                  
                  {/* Quick Period Logging Button */}
                  {currentCycle.isPeriodDay && (
                    <TouchableOpacity
                      onPress={() => setShowPeriodLogging(true)}
                      className="flex-row justify-center items-center px-4 py-2 bg-pink-100 rounded-lg"
                    >
                      <Ionicons name="add-circle" size={16} color="#E91E63" />
                      <Text className="ml-2 text-sm font-medium text-pink-700">Enregistrer mes règles</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="mb-1 text-xl font-bold text-brand-text">Cycle non suivi</Text>
                  <Text className="text-sm text-secondary-600">Activez le suivi pour des recommandations personnalisées</Text>
                </View>
                <View className="justify-center items-center w-16 h-16 rounded-full bg-secondary-300">
                  <Text className="text-2xl text-surface">📅</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Next Workout */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-semibold text-brand-text">Prochain entraînement</Text>
          <TouchableOpacity 
            className="p-6 rounded-xl shadow-sm bg-primary-500 active:bg-primary-600"
            onPress={handleStartWorkout}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="mb-2 text-xl font-bold text-surface">
                  {activeProgram ? activeProgram.title : 'Entraînement adapté'}
                </Text>
                <Text className="text-sm text-primary-100">
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
                  <Text className="mt-1 text-xs text-primary-200">
                    {activeProgram.exerciseCount} exercices • Programme actif
                  </Text>
                )}
              </View>
              <View className="justify-center items-center w-12 h-12 rounded-full bg-surface/20">
                <Text className="text-xl text-surface">▶️</Text>
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
