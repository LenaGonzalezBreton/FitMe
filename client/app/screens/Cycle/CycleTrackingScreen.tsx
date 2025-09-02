import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  StatusBar,
  Modal,
} from 'react-native';
import { useCycleContext } from '../../context/CycleContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import HormoneGraph from '../../components/HormoneGraph';
import PeriodLoggingScreen from './PeriodLoggingScreen';
import PeriodHistoryScreen from './PeriodHistoryScreen';

const { width } = Dimensions.get('window');

interface HormoneData {
  day: number;
  estrogen: number;
  progesterone: number;
  testosterone: number;
}

interface CycleRecommendation {
  cycleDay: number;
  title: string;
  description: string;
  exercises: string[];
  nutrition: string[];
  wellness: string[];
  energy: 'low' | 'medium' | 'high';
  intensity: 'low' | 'medium' | 'high';
}

interface CycleTrackingScreenProps {
  onClose?: () => void;
}

const CycleTrackingScreen = ({ onClose }: CycleTrackingScreenProps) => {
  const { currentCycle, cycleConfig, getCycleCharacteristics, getCycleEmoji, getCycleColor, refreshCycle, refreshConfig } = useCycleContext();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'hormones' | 'recommendations'>('overview');
  const [showPeriodLogging, setShowPeriodLogging] = useState(false);
  const [showPeriodHistory, setShowPeriodHistory] = useState(false);
  
  const generateHormoneData = (cycleLength: number, periodLength: number, currentCycleData: any): HormoneData[] => {
    const data: HormoneData[] = [];
    
    // Use the SAME logic as the API server for calculating phases
    const ovulationDay = Math.max(1, cycleLength - 14); // Same as server logic
    
    for (let day = 1; day <= cycleLength; day++) {
      let estrogen = 0;
      let progesterone = 0;
      let testosterone = 0;
      
      // Use the SAME phase detection logic as the server
      const isPeriodDay = day <= periodLength;
      const isOvulationPhase = day >= ovulationDay - 2 && day <= ovulationDay + 2;
      const isFertileDay = day >= ovulationDay - 5 && day <= ovulationDay + 2;
      const isFollicularPhase = day > periodLength && day <= 14;
      const isLutealPhase = day > ovulationDay + 2;
      
      // Realistic estrogen curve based on cycle phases
      if (isPeriodDay) {
        // Low during menstruation
        estrogen = 15 + (day / periodLength) * 25;
      } else if (isFollicularPhase) {
        // Rising during follicular phase
        const progress = (day - periodLength) / (14 - periodLength);
        estrogen = 40 + progress * 45;
      } else if (isOvulationPhase) {
        // Peak during ovulation
        const distance = Math.abs(day - ovulationDay);
        estrogen = 85 - (distance * 15);
      } else if (isLutealPhase) {
        // Declining during luteal phase  
        const progress = (day - (ovulationDay + 2)) / (cycleLength - (ovulationDay + 2));
        estrogen = 70 - progress * 50;
      }
      
      // Realistic progesterone curve
      if (isPeriodDay || isFollicularPhase) {
        // Very low during period and follicular phase
        progesterone = 5 + Math.random() * 10;
      } else if (isOvulationPhase) {
        // Starts to rise during ovulation
        progesterone = 20 + (day - (ovulationDay - 2)) * 15;
      } else if (isLutealPhase) {
        // High during luteal phase, then drops before period
        const lutealLength = cycleLength - (ovulationDay + 2);
        const progress = (day - (ovulationDay + 2)) / lutealLength;
        if (progress < 0.7) {
          progesterone = 50 + progress * 40; // Rising to peak
        } else {
          progesterone = 90 - ((progress - 0.7) / 0.3) * 85; // Dropping sharply
        }
      }
      
      // Realistic testosterone curve  
      if (isPeriodDay) {
        // Moderate during period
        testosterone = 25 + Math.random() * 15;
      } else if (isFollicularPhase) {
        // Rising during follicular phase
        const progress = (day - periodLength) / (14 - periodLength);
        testosterone = 40 + progress * 35;
      } else if (isOvulationPhase) {
        // Peak around ovulation
        testosterone = 70 + Math.random() * 15;
      } else if (isLutealPhase) {
        // Declining during luteal phase
        const progress = (day - (ovulationDay + 2)) / (cycleLength - (ovulationDay + 2));
        testosterone = 60 - progress * 30;
      }
      
      data.push({
        day,
        estrogen: Math.max(5, Math.min(100, estrogen)),
        progesterone: Math.max(5, Math.min(100, progesterone)),
        testosterone: Math.max(15, Math.min(85, testosterone)),
      });
    }
    
    return data;
  };

  // Generate hormone data using the EXACT same data as the API
  const hormoneData = currentCycle ? generateHormoneData(
    currentCycle.cycleLength, 
    currentCycle.periodLength,
    currentCycle
  ) : [];

  // Cycle-based recommendations
  const getCycleRecommendations = (cycleDay: number, isPeriodDay: boolean, isOvulationPhase: boolean, isFertileDay: boolean): CycleRecommendation => {
    if (isPeriodDay) {
      return {
        cycleDay,
        title: 'Phase Menstruelle',
        description: 'Période de repos et de récupération. Votre corps a besoin de douceur.',
        exercises: [
          'Yoga doux et étirements',
          'Marche légère (20-30 min)',
          'Méditation et respiration',
          'Exercices de mobilité articulaire'
        ],
        nutrition: [
          'Aliments riches en fer (épinards, lentilles)',
          'Magnésium pour les crampes',
          'Hydratation abondante',
          'Éviter la caféine excessive'
        ],
        wellness: [
          'Repos et sommeil de qualité',
          'Gestion du stress',
          'Chaleur pour soulager les crampes',
          'Écoute de votre corps'
        ],
        energy: 'low',
        intensity: 'low'
      };
    } else if (cycleDay <= Math.ceil((currentCycle?.cycleLength || 28) / 2)) {
      return {
        cycleDay,
        title: 'Phase Folliculaire',
        description: 'Énergie en hausse ! Moment idéal pour les entraînements intenses.',
        exercises: [
          'Musculation et renforcement',
          'HIIT et cardio intense',
          'Sports d\'équipe',
          'Entraînements de force'
        ],
        nutrition: [
          'Protéines pour la récupération',
          'Glucides complexes',
          'Antioxydants',
          'Suppléments de fer si nécessaire'
        ],
        wellness: [
          'Objectifs ambitieux',
          'Nouvelles habitudes',
          'Socialisation',
          'Projets créatifs'
        ],
        energy: 'high',
        intensity: 'high'
      };
    } else if (isOvulationPhase) {
      return {
        cycleDay,
        title: 'Phase Ovulatoire',
        description: 'Pic d\'énergie et de performance. Profitez de votre potentiel maximal !',
        exercises: [
          'Entraînements de performance',
          'Compétitions sportives',
          'Exercices explosifs',
          'Entraînements de haute intensité'
        ],
        nutrition: [
          'Aliments anti-inflammatoires',
          'Oméga-3',
          'Vitamines B',
          'Hydratation optimale'
        ],
        wellness: [
          'Prise de décisions importantes',
          'Présentations et réunions',
          'Activités sociales',
          'Confiance en soi'
        ],
        energy: 'high',
        intensity: 'high'
      };
    } else {
      return {
        cycleDay,
        title: 'Phase Lutéale',
        description: 'Énergie qui diminue progressivement. Privilégiez la récupération.',
        exercises: [
          'Yoga et pilates',
          'Cardio modéré',
          'Étirements et mobilité',
          'Marche et activités douces'
        ],
        nutrition: [
          'Aliments riches en tryptophane',
          'Magnésium et calcium',
          'Éviter le sucre raffiné',
          'Repas réguliers et équilibrés'
        ],
        wellness: [
          'Gestion du stress',
          'Sommeil de qualité',
          'Activités relaxantes',
          'Préparation à la menstruation'
        ],
        energy: 'medium',
        intensity: 'medium'
      };
    }
  };

  const currentRecommendations = currentCycle ? getCycleRecommendations(
    currentCycle.cycleDay,
    currentCycle.isPeriodDay,
    currentCycle.isOvulationPhase,
    currentCycle.isFertileDay
  ) : null;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshCycle(), refreshConfig()]);
    setRefreshing(false);
  };

  useEffect(() => {
    // Ensure we have fresh data when screen mounts
    refreshCycle();
    refreshConfig();
  }, []);

  const getEnergyColor = (energy: 'low' | 'medium' | 'high'): string => {
    switch (energy) {
      case 'low': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-green-100 text-green-700';
    }
  };

  const getIntensityColor = (intensity: 'low' | 'medium' | 'high'): string => {
    switch (intensity) {
      case 'low': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'high': return 'bg-red-100 text-red-700';
    }
  };

  if (!user || user.isMenopausal) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">🌙</Text>
          <Text className="text-2xl font-bold text-brand-text mb-4 text-center">
            Suivi du cycle non disponible
          </Text>
          <Text className="text-secondary-600 text-center">
            Le suivi détaillé du cycle n'est pas applicable en période de ménopause.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCycle || !cycleConfig?.isCycleTrackingEnabled) {
    return (
      <SafeAreaView className="flex-1 bg-brand-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">📅</Text>
          <Text className="text-2xl font-bold text-brand-text mb-4 text-center">
            Cycle non configuré
          </Text>
          <Text className="text-secondary-600 text-center mb-6">
            Activez le suivi de votre cycle pour accéder aux recommandations personnalisées.
          </Text>
          <TouchableOpacity className="bg-primary-500 py-3 px-6 rounded-xl">
            <Text className="text-surface font-bold">Configurer le cycle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F5EFE6" />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-brand-text mb-1">Suivi du cycle</Text>
              <Text className="text-sm text-secondary-600">
                Comprenez votre corps et optimisez votre bien-être
              </Text>
            </View>
            {onClose && (
              <TouchableOpacity
                onPress={onClose}
                className="bg-surface rounded-full w-10 h-10 items-center justify-center shadow-sm border border-border-light"
              >
                <Ionicons name="close" size={20} color="#8B5A3C" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Current Cycle Card */}
        <View className="px-4 mb-4">
          <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-brand-text mb-1">
                  {getCycleCharacteristics(
                    currentCycle.cycleDay,
                    currentCycle.isPeriodDay,
                    currentCycle.isOvulationPhase,
                    currentCycle.isFertileDay,
                    currentCycle.cycleLength
                  )}
                </Text>
                <Text className="text-sm text-secondary-600 mb-2">
                  Jour {currentCycle.cycleDay} de votre cycle ({currentCycle.cycleLength} jours)
                </Text>
                {currentCycle.daysUntilNextCycle > 0 && (
                  <Text className="text-xs text-secondary-500">
                    {currentCycle.daysUntilNextCycle} jour{currentCycle.daysUntilNextCycle > 1 ? 's' : ''} avant le prochain cycle
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
                <Text className="text-brand-text text-2xl">{getCycleEmoji(
                  currentCycle.cycleDay,
                  currentCycle.isPeriodDay,
                  currentCycle.isOvulationPhase,
                  currentCycle.isFertileDay,
                  currentCycle.cycleLength
                )}</Text>
              </View>
            </View>
            
            {/* Cycle Description (more prominent) */}
            <View className="bg-primary-50 border border-primary-200 rounded-lg p-3 mb-4">
              <Text className="text-primary-700 text-sm">
                {currentCycle.cycleDescription}
              </Text>
            </View>

            {/* Energy and Intensity Indicators */}
            {currentRecommendations && (
              <View className="flex-row space-x-3">
                <View className={`px-3 py-1 rounded-full ${getEnergyColor(currentRecommendations.energy)}`}>
                  <Text className="text-xs font-medium">
                    Énergie: {currentRecommendations.energy === 'low' ? 'Faible' : 
                              currentRecommendations.energy === 'medium' ? 'Modérée' : 'Élevée'}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getIntensityColor(currentRecommendations.intensity)}`}>
                  <Text className="text-xs font-medium">
                    Intensité: {currentRecommendations.intensity === 'low' ? 'Douce' : 
                                currentRecommendations.intensity === 'medium' ? 'Modérée' : 'Intense'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View className="px-4 mb-4">
          <View className="flex-row bg-surface rounded-xl p-1 shadow-sm border border-border-light">
            <TouchableOpacity
              onPress={() => setSelectedTab('overview')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                selectedTab === 'overview' ? 'bg-primary-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                selectedTab === 'overview' ? 'text-surface' : 'text-secondary-600'
              }`}>
                Vue d'ensemble
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSelectedTab('hormones')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                selectedTab === 'hormones' ? 'bg-primary-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                selectedTab === 'hormones' ? 'text-surface' : 'text-secondary-600'
              }`}>
                Hormones
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSelectedTab('recommendations')}
              className={`flex-1 py-3 px-4 rounded-lg ${
                selectedTab === 'recommendations' ? 'bg-primary-500' : 'bg-transparent'
              }`}
            >
              <Text className={`text-center font-medium ${
                selectedTab === 'recommendations' ? 'text-surface' : 'text-secondary-600'
              }`}>
                Recommandations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <View className="px-4 mb-4">
            {/* Cycle Timeline */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
              <Text className="text-lg font-bold text-brand-text mb-4">Timeline du cycle</Text>
              
              {/* Simple cycle visualization */}
              <View className="flex-row justify-between items-center mb-4">
                {(() => {
                  const len = currentCycle.cycleLength;
                  const quarter = Math.max(1, Math.round(len / 4));
                  const ticks = [1, quarter, 2 * quarter, 3 * quarter, len];
                  return ticks.map((day, idx) => (
                  <View key={day} className="items-center">
                    <View className={`w-4 h-4 rounded-full mb-2 ${
                      currentCycle.cycleDay >= day ? 'bg-primary-500' : 'bg-border'
                    }`} />
                    <Text className="text-xs text-secondary-600">J{day}</Text>
                  </View>
                  ));
                })()}
              </View>
              
              {/* Phase markers */}
              <View className="flex-row justify-between">
                <Text className="text-xs text-secondary-500">Menstruelle</Text>
                <Text className="text-xs text-secondary-500">Folliculaire</Text>
                <Text className="text-xs text-secondary-500">Ovulation</Text>
                <Text className="text-xs text-secondary-500">Lutéale</Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
              <Text className="text-lg font-bold text-brand-text mb-4">Statistiques</Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-primary-500">{currentCycle.cycleLength}</Text>
                  <Text className="text-sm text-secondary-600">Jours de cycle</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-accent-500">{currentCycle.periodLength || cycleConfig.averagePeriodLength}</Text>
                  <Text className="text-sm text-secondary-600">Jours de règles</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-success-500">{currentCycle.cycleDay}</Text>
                  <Text className="text-sm text-secondary-600">Jour actuel</Text>
                </View>
              </View>
            </View>

            {/* Period Tracking Actions */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mt-4">
              <Text className="text-lg font-bold text-brand-text mb-4">Suivi des règles</Text>
              
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => setShowPeriodLogging(true)}
                  className="bg-primary-500 py-4 px-4 rounded-xl flex-row items-center justify-center"
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text className="text-surface font-bold text-lg ml-2">Enregistrer mes règles</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowPeriodHistory(true)}
                  className="bg-secondary-200 py-4 px-4 rounded-xl flex-row items-center justify-center"
                >
                  <Ionicons name="calendar" size={20} color="#8B5A3C" />
                  <Text className="text-secondary-700 font-bold text-lg ml-2">Voir l'historique</Text>
                </TouchableOpacity>
              </View>
              
              <Text className="text-xs text-secondary-500 text-center mt-3">
                Enregistrez le début de vos règles pour un suivi précis de votre cycle
              </Text>
            </View>
          </View>
        )}

        {selectedTab === 'hormones' && (
          <View className="px-4 mb-4">
            <HormoneGraph 
              data={hormoneData}
              currentDay={currentCycle.cycleDay}
              cycleLength={currentCycle.cycleLength}
              periodLength={currentCycle.periodLength}
            />
            
            {/* Additional hormone info */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mt-4">
              <Text className="text-lg font-bold text-brand-text mb-4">Informations hormonales</Text>
              
              <View className="space-y-4">
                <View className="p-3 bg-pink-50 rounded-lg">
                  <Text className="text-sm font-semibold text-pink-700 mb-1">Œstrogène</Text>
                  <Text className="text-xs text-pink-600">
                    Hormone principale de la première moitié du cycle. Favorise l'énergie, la motivation et la performance physique.
                  </Text>
                </View>
                
                <View className="p-3 bg-blue-50 rounded-lg">
                  <Text className="text-sm font-semibold text-blue-700 mb-1">Progestérone</Text>
                  <Text className="text-xs text-blue-600">
                    Hormone dominante de la seconde moitié du cycle. Favorise la récupération et la préparation à la menstruation.
                  </Text>
                </View>
                
                <View className="p-3 bg-green-50 rounded-lg">
                  <Text className="text-sm font-semibold text-green-700 mb-1">Testostérone</Text>
                  <Text className="text-xs text-green-600">
                    Hormone présente tout au long du cycle avec des pics. Améliore la force, la confiance et la libido.
                  </Text>
                </View>
              </View>

              <Text className="text-xs text-secondary-500 mt-4">
                * Les niveaux sont approximatifs et basés sur des moyennes. Consultez un professionnel de santé pour des analyses précises.
              </Text>
            </View>
          </View>
        )}

        {selectedTab === 'recommendations' && currentRecommendations && (
          <View className="px-4 mb-4 space-y-4">
            {/* Exercise Recommendations */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
              <View className="flex-row items-center mb-4">
                <Ionicons name="fitness" size={24} color="#8B5A3C" />
                <Text className="text-lg font-bold text-brand-text ml-3">Exercices recommandés</Text>
              </View>
              <View className="space-y-2">
                {currentRecommendations.exercises.map((exercise, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                    <Text className="text-sm text-brand-text flex-1">{exercise}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Nutrition Recommendations */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
              <View className="flex-row items-center mb-4">
                <Ionicons name="nutrition" size={24} color="#8B5A3C" />
                <Text className="text-lg font-bold text-brand-text ml-3">Nutrition</Text>
              </View>
              <View className="space-y-2">
                {currentRecommendations.nutrition.map((item, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-2 h-2 bg-accent-500 rounded-full mr-3" />
                    <Text className="text-sm text-brand-text flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Wellness Recommendations */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
              <View className="flex-row items-center mb-4">
                <Ionicons name="heart" size={24} color="#8B5A3C" />
                <Text className="text-lg font-bold text-brand-text ml-3">Bien-être</Text>
              </View>
              <View className="space-y-2">
                {currentRecommendations.wellness.map((item, index) => (
                  <View key={index} className="flex-row items-center">
                    <View className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                    <Text className="text-sm text-brand-text flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Period Logging Modal */}
      <Modal
        visible={showPeriodLogging}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPeriodLogging(false)}
      >
        <PeriodLoggingScreen onClose={() => setShowPeriodLogging(false)} />
      </Modal>

      {/* Period History Modal */}
      <Modal
        visible={showPeriodHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPeriodHistory(false)}
      >
        <PeriodHistoryScreen onClose={() => setShowPeriodHistory(false)} />
      </Modal>
    </SafeAreaView>
  );
};

export default CycleTrackingScreen;
