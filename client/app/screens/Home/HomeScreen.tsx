import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../hooks/useCycle';
import { useStreak } from '../../hooks/useStreak';
import { usePrograms } from '../../hooks/usePrograms';

interface HomeScreenProps {
  navigation: NavigationProp<any, any>;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const { currentPhase, cycleConfig, getPhaseLabel, getPhaseEmoji, getPhaseColor } = useCycle();
  const { streakData, logWorkout } = useStreak();
  const { activeProgram } = usePrograms();

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

        {/* Current Phase Card */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-brand-text mb-3">Phase actuelle</Text>
          <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
            {user?.isMenopausal ? (
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">Post-ménopause</Text>
                  <Text className="text-sm text-secondary-600">Entraînements adaptés à votre situation</Text>
                </View>
                <View className="bg-secondary-500 rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-surface text-xl">🌙</Text>
                </View>
              </View>
            ) : currentPhase ? (
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">{getPhaseLabel(currentPhase.phase)}</Text>
                  <Text className="text-sm text-secondary-600 mb-1">Jour {currentPhase.cycleDay} de votre cycle ({currentPhase.cycleLength} jours)</Text>
                  {currentPhase.daysUntilNextPhase > 0 && (
                    <Text className="text-xs text-secondary-500">
                      {currentPhase.daysUntilNextPhase} jour{currentPhase.daysUntilNextPhase > 1 ? 's' : ''} avant la prochaine phase
                    </Text>
                  )}
                </View>
                <View className={`${getPhaseColor(currentPhase.phase)} rounded-full w-12 h-12 items-center justify-center`}>
                  <Text className="text-brand-text text-xl">{getPhaseEmoji(currentPhase.phase)}</Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-brand-text mb-1">Cycle non suivi</Text>
                  <Text className="text-sm text-secondary-600">Activez le suivi pour des recommandations personnalisées</Text>
                </View>
                <View className="bg-secondary-300 rounded-full w-12 h-12 items-center justify-center">
                  <Text className="text-surface text-xl">📅</Text>
                </View>
              </View>
            )}
            
            {/* Phase Timeline - only show for non-menopausal users with cycle tracking */}
            {!user?.isMenopausal && currentPhase && (
              <View className="mt-4">
                <View className="flex-row space-x-2 mb-3">
                  {cyclePhases.map((phase) => (
                    <View key={phase.name} className="flex-1 h-2 rounded-full">
                      <View className={`h-full rounded-full ${phase.color}`} />
                    </View>
                  ))}
                </View>
                
                {/* Phase Recommendations */}
                {currentPhase.recommendations && currentPhase.recommendations.length > 0 && (
                  <View className="bg-primary-50 p-3 rounded-lg">
                    <Text className="text-sm font-semibold text-primary-700 mb-2">Recommandations pour cette phase :</Text>
                    {currentPhase.recommendations.slice(0, 2).map((rec, index) => (
                      <Text key={index} className="text-xs text-primary-600 mb-1">• {rec}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
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
    </SafeAreaView>
  );
};

export default HomeScreen; 
