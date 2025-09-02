import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { usePeriods } from '../../hooks/usePeriods';
import { Ionicons } from '@expo/vector-icons';
import { cycleApi } from '../../services/api';
import {
  Period,
  CyclePredictionsResponse,
  CycleComparisonResponse,
} from '../../types';

interface PeriodHistoryScreenProps {
  onClose?: () => void;
}

type ViewMode = 'timeline' | 'calendar' | 'comparison' | 'predictions';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 32;
const DAY_SIZE = (CALENDAR_WIDTH - 48) / 7;

const PeriodHistoryScreen = ({ onClose }: PeriodHistoryScreenProps) => {
  const { periods, loading, refreshPeriods } = usePeriods();
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedPeriod, setSelectedPeriod] = useState<any | null>(null);
  const [predictions, setPredictions] = useState<CyclePredictionsResponse | null>(null);
  const [comparison, setComparison] = useState<CycleComparisonResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [dailyNote, setDailyNote] = useState('');
  const [dailyNotes, setDailyNotes] = useState<{[key: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        refreshPeriods(),
        loadPredictions(),
        loadComparison(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadPredictions = async () => {
    try {
      const predictionsData = await cycleApi.getCyclePredictions();
      setPredictions(predictionsData);
    } catch (error) {
      console.log('No predictions available:', error);
    }
  };

  const loadComparison = async () => {
    try {
      const comparisonData = await cycleApi.getCycleComparison({ lastNCycles: 3 });
      setComparison(comparisonData);
    } catch (error) {
      console.log('No comparison available:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Filter periods based on search query
  const filteredPeriods = periods.filter(period => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      period.notes?.toLowerCase().includes(searchLower) ||
      new Date(period.startDate).toLocaleDateString('fr-FR').includes(searchLower)
    );
  });

  // Calendar helper functions
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPeriodForDate = (date: Date): any | null => {
    const dateStr = date.toISOString().split('T')[0];
    return periods.find(period => {
      const startDate = new Date(period.startDate);
      const periodLength = period.periodLength || 5;
      const endDate = new Date(startDate.getTime() + (periodLength - 1) * 24 * 60 * 60 * 1000);
      return date >= startDate && date <= endDate;
    }) || null;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPeriodDay = (date: Date): boolean => {
    return getPeriodForDate(date) !== null;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const openNoteModal = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    setSelectedCalendarDate(date);
    setDailyNote(dailyNotes[dateKey] || '');
    setNoteModalVisible(true);
  };

  const saveDailyNote = () => {
    if (selectedCalendarDate) {
      const dateKey = selectedCalendarDate.toISOString().split('T')[0];
      setDailyNotes(prev => ({
        ...prev,
        [dateKey]: dailyNote,
      }));
      setNoteModalVisible(false);
      setDailyNote('');
      setSelectedCalendarDate(null);
      // TODO: Save to API if needed
    }
  };

  const getFlowIntensityLabel = (intensity?: number): string => {
    if (!intensity) return 'Non spécifié';
    switch (intensity) {
      case 1: return 'Très léger';
      case 2: return 'Léger';
      case 3: return 'Modéré';
      case 4: return 'Abondant';
      case 5: return 'Très abondant';
      default: return 'Modéré';
    }
  };

  const getFlowIntensityColor = (intensity?: number): string => {
    switch (intensity) {
      case 1: return 'bg-pink-200';
      case 2: return 'bg-pink-300';
      case 3: return 'bg-pink-400';
      case 4: return 'bg-pink-500';
      case 5: return 'bg-pink-600';
      default: return 'bg-pink-400';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPeriodDuration = (period: any): number => {
    return period.periodLength || 5;
  };

  const getDaysSincePeriod = (dateString: string): number => {
    const periodDate = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - periodDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderViewModeSelector = () => (
    <View className="flex-row bg-border-light rounded-lg p-1 mb-4">
      {[
        { mode: 'timeline', icon: 'list', label: 'Timeline' },
        { mode: 'calendar', icon: 'calendar', label: 'Calendrier' },
        { mode: 'predictions', icon: 'analytics', label: 'Prédictions' },
        { mode: 'comparison', icon: 'bar-chart', label: 'Comparaison' },
      ].map((item) => (
        <TouchableOpacity
          key={item.mode}
          onPress={() => setViewMode(item.mode as ViewMode)}
          className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-md ${
            viewMode === item.mode ? 'bg-surface shadow-sm' : ''
          }`}
        >
          <Ionicons 
            name={item.icon as any} 
            size={16} 
            color={viewMode === item.mode ? "#8B5A3C" : "#A99985"} 
          />
          <Text 
            className={`ml-2 text-xs font-medium ${
              viewMode === item.mode ? 'text-brand-text' : 'text-secondary-600'
            }`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCalendarView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={{ width: DAY_SIZE, height: DAY_SIZE }} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const period = getPeriodForDate(date);
      const isPeriod = isPeriodDay(date);
      const isCurrentDay = isToday(date);
      const dateKey = date.toISOString().split('T')[0];
      const hasNote = dailyNotes[dateKey]?.length > 0;

      days.push(
        <TouchableOpacity
          key={day}
          style={{ width: DAY_SIZE, height: DAY_SIZE }}
          className="items-center justify-center relative"
          onPress={() => isPeriod ? openNoteModal(date) : null}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              isPeriod
                ? period
                  ? getFlowIntensityColor(period.flowIntensity)
                  : 'bg-pink-400'
                : isCurrentDay
                ? 'bg-primary-100'
                : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isPeriod
                  ? 'text-white'
                  : isCurrentDay
                  ? 'text-primary-700'
                  : 'text-brand-text'
              }`}
            >
              {day}
            </Text>
          </View>
          {hasNote && (
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">•</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View>
        {/* Calendar */}
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
          {/* Month Navigation */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
              className="p-2"
            >
              <Ionicons name="chevron-back" size={24} color="#8B5A3C" />
            </TouchableOpacity>
            
            <Text className="text-lg font-bold text-brand-text">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </Text>
            
            <TouchableOpacity
              onPress={() => navigateMonth('next')}
              className="p-2"
            >
              <Ionicons name="chevron-forward" size={24} color="#8B5A3C" />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View className="flex-row mb-2">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
              <View key={index} style={{ width: DAY_SIZE }} className="items-center">
                <Text className="text-xs font-medium text-secondary-600">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {days}
          </View>

          {/* Legend */}
          <View className="mt-4 pt-4 border-t border-border-light">
            <Text className="text-sm font-medium text-brand-text mb-2">Légende</Text>
            <View className="flex-row flex-wrap">
              <View className="flex-row items-center mr-4 mb-2">
                <View className="w-3 h-3 bg-pink-200 rounded-full mr-2" />
                <Text className="text-xs text-secondary-600">Très léger</Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <View className="w-3 h-3 bg-pink-400 rounded-full mr-2" />
                <Text className="text-xs text-secondary-600">Modéré</Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <View className="w-3 h-3 bg-pink-600 rounded-full mr-2" />
                <Text className="text-xs text-secondary-600">Abondant</Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <View className="w-3 h-3 bg-accent-500 rounded-full mr-2" />
                <Text className="text-xs text-secondary-600">Note ajoutée</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#8B5A3C" />
            <Text className="text-brand-text font-medium ml-2">Comment utiliser le calendrier</Text>
          </View>
          <Text className="text-secondary-600 text-sm leading-5">
            • Touchez un jour de règles pour ajouter ou modifier une note{'\n'}
            • Les points orange indiquent les jours avec des notes{'\n'}
            • Les couleurs représentent l'intensité du flux
          </Text>
        </View>

        {/* Current Month Notes */}
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
          <Text className="text-brand-text font-bold text-base mb-3">Notes du mois</Text>
          {Object.entries(dailyNotes)
            .filter(([dateStr, note]) => {
              const noteDate = new Date(dateStr);
              return noteDate.getMonth() === currentDate.getMonth() && 
                     noteDate.getFullYear() === currentDate.getFullYear() &&
                     note.length > 0;
            })
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([dateStr, note]) => (
              <View key={dateStr} className="mb-3 p-3 bg-primary-25 rounded-lg">
                <Text className="text-brand-text font-medium mb-1">
                  {formatShortDate(dateStr)}
                </Text>
                <Text className="text-secondary-700 text-sm">{note}</Text>
              </View>
            ))}
          {Object.entries(dailyNotes).filter(([dateStr, note]) => {
            const noteDate = new Date(dateStr);
            return noteDate.getMonth() === currentDate.getMonth() && 
                   noteDate.getFullYear() === currentDate.getFullYear() &&
                   note.length > 0;
          }).length === 0 && (
            <Text className="text-secondary-600 text-sm text-center py-4">
              Aucune note pour ce mois
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTimelineView = () => (
    <View>
      {/* Search Bar */}
      <View className="bg-surface rounded-lg p-3 mb-4 border border-border-light">
        <View className="flex-row items-center">
          <Ionicons name="search" size={20} color="#A99985" />
          <TextInput
            className="flex-1 ml-3 text-brand-text"
            placeholder="Rechercher par date ou notes..."
            placeholderTextColor="#A99985"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#A99985" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Timeline */}
      {filteredPeriods.length === 0 ? (
        <View className="bg-surface rounded-xl p-8 items-center border border-border-light">
          <Text className="text-6xl mb-4">📅</Text>
          <Text className="text-brand-text font-bold text-lg mb-2">
            {searchQuery ? 'Aucun résultat' : 'Aucune période enregistrée'}
          </Text>
          <Text className="text-secondary-600 text-center">
            {searchQuery 
              ? 'Essayez d\'autres mots-clés'
              : 'Commencez à enregistrer vos règles pour suivre votre cycle'
            }
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          {filteredPeriods.map((period, index) => {
            const isSelected = selectedPeriod?.id === period.id;
            const daysSince = getDaysSincePeriod(period.startDate);
            
            return (
              <TouchableOpacity
                key={period.id}
                onPress={() => setSelectedPeriod(isSelected ? null : period)}
                className={`bg-surface rounded-xl border ${
                  isSelected ? 'border-primary-500 shadow-lg' : 'border-border-light shadow-sm'
                }`}
              >
                {/* Main Period Card */}
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className={`w-4 h-4 rounded-full mr-3 ${getFlowIntensityColor(period.flowIntensity)}`} />
                      <View>
                        <Text className="text-brand-text font-bold text-base">
                          {formatShortDate(period.startDate)}
                        </Text>
                        <Text className="text-secondary-600 text-sm">
                          Il y a {daysSince} jours
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-brand-text font-medium">
                        {getPeriodDuration(period)} jour{getPeriodDuration(period) > 1 ? 's' : ''}
                      </Text>
                      <Text className="text-secondary-600 text-sm">
                        {getFlowIntensityLabel(period.flowIntensity)}
                      </Text>
                    </View>
                  </View>

                  {period.notes && (
                    <View className="bg-primary-50 rounded-lg p-3 mb-3">
                      <Text className="text-primary-700 text-sm">{period.notes}</Text>
                    </View>
                  )}

                  {/* Quick Stats */}
                  <View className="flex-row justify-between pt-3 border-t border-border-light">
                    <View className="items-center">
                      <Text className="text-brand-text font-medium">
                        {period.cycleLength || 28}j
                      </Text>
                      <Text className="text-secondary-600 text-xs">Cycle</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-brand-text font-medium">
                        {period.isRegular ? '✅' : '⚠️'}
                      </Text>
                      <Text className="text-secondary-600 text-xs">
                        {period.isRegular ? 'Régulier' : 'Irrégulier'}
                      </Text>
                    </View>
                    <TouchableOpacity className="items-center">
                      <Ionicons 
                        name={isSelected ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#A99985" 
                      />
                      <Text className="text-secondary-600 text-xs">Détails</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Expanded Details */}
                {isSelected && (
                  <View className="px-4 pb-4 border-t border-border-light bg-primary-25">
                    <View className="pt-3 space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-secondary-600">Date de fin estimée</Text>
                        <Text className="text-brand-text font-medium">
                          {(() => {
                            const startDate = new Date(period.startDate);
                            const endDate = new Date(startDate.getTime() + (getPeriodDuration(period) - 1) * 24 * 60 * 60 * 1000);
                            return formatShortDate(endDate.toISOString());
                          })()}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between">
                        <Text className="text-secondary-600">Durée du cycle</Text>
                        <Text className="text-brand-text font-medium">
                          {period.cycleLength || 28} jours
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-secondary-600">Enregistré le</Text>
                        <Text className="text-brand-text font-medium">
                          {formatShortDate(period.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );

  const renderPredictionsView = () => {
    if (!predictions) {
      return (
        <View className="bg-surface rounded-xl p-8 items-center border border-border-light">
          <Text className="text-4xl mb-4">🔮</Text>
          <Text className="text-brand-text font-bold text-lg mb-2">Prédictions non disponibles</Text>
          <Text className="text-secondary-600 text-center">
            Enregistrez au moins 2 cycles pour obtenir des prédictions
          </Text>
        </View>
      );
    }

    const { predictions: pred } = predictions;
    const nextPeriodDate = new Date(pred.nextPeriodStart);
    const nextOvulationDate = new Date(pred.nextOvulation);

    return (
      <View className="space-y-4">
        {/* Confidence Indicator */}
        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-brand-text font-bold text-lg">Prédictions</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-success-500 rounded-full mr-2" />
              <Text className="text-success-600 font-medium">{pred.confidence}% fiables</Text>
            </View>
          </View>
          
          <Text className="text-secondary-600 text-sm">
            Basées sur l'analyse de votre historique personnel
          </Text>
        </View>

        {/* Next Period Prediction */}
        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-pink-100 rounded-full items-center justify-center mr-3">
              <Text className="text-2xl">🩸</Text>
            </View>
            <View className="flex-1">
              <Text className="text-brand-text font-bold text-base">Prochaines règles</Text>
              <Text className="text-secondary-600">
                Dans {pred.daysUntilNextPeriod} jour{pred.daysUntilNextPeriod > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text className="text-brand-text text-lg font-medium">
            {formatDate(pred.nextPeriodStart)}
          </Text>
        </View>

        {/* Next Ovulation Prediction */}
        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <View className="flex-row items-center mb-3">
            <View className="w-12 h-12 bg-accent-100 rounded-full items-center justify-center mr-3">
              <Text className="text-2xl">🥚</Text>
            </View>
            <View className="flex-1">
              <Text className="text-brand-text font-bold text-base">Prochaine ovulation</Text>
              <Text className="text-secondary-600">
                Dans {pred.daysUntilOvulation} jour{pred.daysUntilOvulation > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text className="text-brand-text text-lg font-medium">
            {formatDate(pred.nextOvulation)}
          </Text>
        </View>

        {/* Current Cycle Info */}
        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <Text className="text-brand-text font-bold text-base mb-3">Cycle actuel</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Jour du cycle</Text>
              <Text className="text-brand-text font-medium">Jour {pred.currentCycleDay}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Phase actuelle</Text>
              <Text className="text-brand-text font-medium capitalize">{pred.currentCycleCharacteristics}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderComparisonView = () => {
    if (!comparison) {
      return (
        <View className="bg-surface rounded-xl p-8 items-center border border-border-light">
          <Text className="text-4xl mb-4">📊</Text>
          <Text className="text-brand-text font-bold text-lg mb-2">Comparaison non disponible</Text>
          <Text className="text-secondary-600 text-center">
            Enregistrez au moins 2 cycles pour voir les comparaisons
          </Text>
        </View>
      );
    }

    return (
      <View className="space-y-4">
        {/* Insights */}
        {comparison.insights.length > 0 && (
          <View className="bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-brand-text font-bold text-base mb-3">Insights</Text>
            <View className="space-y-2">
              {comparison.insights.map((insight, index) => (
                <Text key={index} className="text-secondary-700 text-sm leading-5">
                  {insight}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Trends */}
        {comparison.trends.length > 0 && (
          <View className="bg-surface rounded-xl p-4 border border-border-light">
            <Text className="text-brand-text font-bold text-base mb-3">Tendances</Text>
            <View className="space-y-3">
              {comparison.trends.map((trend, index) => (
                <View key={index} className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-3 ${
                    trend.trend === 'increasing' ? 'bg-accent-500' :
                    trend.trend === 'decreasing' ? 'bg-primary-500' : 'bg-success-500'
                  }`} />
                  <View className="flex-1">
                    <Text className="text-brand-text font-medium">{trend.metric}</Text>
                    <Text className="text-secondary-600 text-sm">{trend.description}</Text>
                  </View>
                  <Text className={`font-bold text-sm ${
                    trend.trend === 'increasing' ? 'text-accent-500' :
                    trend.trend === 'decreasing' ? 'text-primary-500' : 'text-success-500'
                  }`}>
                    {trend.trend === 'increasing' ? '↗' : trend.trend === 'decreasing' ? '↘' : '→'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Averages */}
        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <Text className="text-brand-text font-bold text-base mb-3">Moyennes</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-500">
                {comparison.averages.cycleLength}j
              </Text>
              <Text className="text-sm text-secondary-600">Cycle moyen</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-accent-500">
                {comparison.averages.periodLength}j
              </Text>
              <Text className="text-sm text-secondary-600">Règles moyennes</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-success-500">
                {comparison.averages.regularityRate}%
              </Text>
              <Text className="text-sm text-secondary-600">Régularité</Text>
            </View>
          </View>
        </View>

        {/* Cycle Details */}
        <View className="bg-surface rounded-xl p-4 border border-border-light">
          <Text className="text-brand-text font-bold text-base mb-3">
            Cycles analysés ({comparison.cycles.length})
          </Text>
          <View className="space-y-3">
            {comparison.cycles.map((cycle, index) => (
              <View key={index} className="flex-row items-center justify-between p-3 bg-primary-25 rounded-lg">
                <View>
                  <Text className="text-brand-text font-medium">
                    Cycle #{cycle.cycleNumber}
                  </Text>
                  <Text className="text-secondary-600 text-sm">
                    {formatShortDate(cycle.startDate)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-brand-text font-medium">
                    {cycle.cycleLength}j / {cycle.periodLength}j
                  </Text>
                  <Text className="text-secondary-600 text-sm">
                    {cycle.isRegular ? '✅ Régulier' : '⚠️ Irrégulier'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F5EFE6" />
      
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-brand-text mb-1">
              Historique menstruel
            </Text>
            <Text className="text-sm text-secondary-600">
              Analyse complète de votre cycle
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
        {renderViewModeSelector()}
      </View>

      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5A3C']}
            tintColor="#8B5A3C"
          />
        }
      >
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'calendar' && renderCalendarView()}
        {viewMode === 'predictions' && renderPredictionsView()}
        {viewMode === 'comparison' && renderComparisonView()}
        
        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={noteModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-brand-background">
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-brand-text mb-1">
                  Ajouter une note
                </Text>
                <Text className="text-sm text-secondary-600">
                  {selectedCalendarDate && formatDate(selectedCalendarDate.toISOString())}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                className="bg-surface rounded-full w-10 h-10 items-center justify-center shadow-sm border border-border-light"
              >
                <Ionicons name="close" size={20} color="#8B5A3C" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
              <Text className="text-brand-text font-medium mb-3">Comment vous sentez-vous aujourd'hui ?</Text>
              <TextInput
                className="bg-brand-background border border-border-light rounded-lg p-3 text-brand-text min-h-[120px]"
                placeholder="Décrivez vos symptômes, votre humeur, votre énergie..."
                placeholderTextColor="#A99985"
                value={dailyNote}
                onChangeText={setDailyNote}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Quick Suggestions */}
            <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
              <Text className="text-brand-text font-medium mb-3">Suggestions rapides</Text>
              <View className="flex-row flex-wrap">
                {[
                  '😴 Fatiguée', '😊 En forme', '😣 Crampes', '🍫 Envies sucrées',
                  '😤 Irritée', '💪 Énergique', '🤕 Mal de tête', '😢 Émotive',
                  '🏃‍♀️ Sportive', '😌 Détendue', '🤒 Nausées', '💤 Besoin de repos'
                ].map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() => {
                      const newNote = dailyNote ? `${dailyNote} ${suggestion}` : suggestion;
                      setDailyNote(newNote);
                    }}
                    className="bg-primary-100 rounded-full px-3 py-2 mr-2 mb-2"
                  >
                    <Text className="text-primary-700 text-sm">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="px-4 pb-4 pt-2 border-t border-border-light bg-surface">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                className="flex-1 bg-border-light rounded-lg py-3 items-center"
              >
                <Text className="text-secondary-600 font-medium">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveDailyNote}
                className="flex-1 bg-primary-500 rounded-lg py-3 items-center"
              >
                <Text className="text-white font-medium">Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default PeriodHistoryScreen;
