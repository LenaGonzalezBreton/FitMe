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
    <View className="flex-row p-1 mb-4 rounded-lg bg-border-light">
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
          className="relative justify-center items-center"
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
            <View className="absolute -top-1 -right-1 justify-center items-center w-3 h-3 rounded-full bg-accent-500">
              <Text className="text-xs font-bold text-white">•</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View>
        {/* Calendar */}
        <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
          {/* Month Navigation */}
          <View className="flex-row justify-between items-center mb-4">
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
          <View className="pt-4 mt-4 border-t border-border-light">
            <Text className="mb-2 text-sm font-medium text-brand-text">Légende</Text>
            <View className="flex-row flex-wrap">
              <View className="flex-row items-center mr-4 mb-2">
                <View className="mr-2 w-3 h-3 bg-pink-200 rounded-full" />
                <Text className="text-xs text-secondary-600">Très léger</Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <View className="mr-2 w-3 h-3 bg-pink-400 rounded-full" />
                <Text className="text-xs text-secondary-600">Modéré</Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <View className="mr-2 w-3 h-3 bg-pink-600 rounded-full" />
                <Text className="text-xs text-secondary-600">Abondant</Text>
              </View>
              <View className="flex-row items-center mr-4 mb-2">
                <View className="mr-2 w-3 h-3 rounded-full bg-accent-500" />
                <Text className="text-xs text-secondary-600">Note ajoutée</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#8B5A3C" />
            <Text className="ml-2 font-medium text-brand-text">Comment utiliser le calendrier</Text>
          </View>
          <Text className="text-sm leading-5 text-secondary-600">
            • Touchez un jour de règles pour ajouter ou modifier une note{'\n'}
            • Les points orange indiquent les jours avec des notes{'\n'}
            • Les couleurs représentent l'intensité du flux
          </Text>
        </View>

        {/* Current Month Notes */}
        <View className="p-4 rounded-xl border shadow-sm bg-surface border-border-light">
          <Text className="mb-3 text-base font-bold text-brand-text">Notes du mois</Text>
          {Object.entries(dailyNotes)
            .filter(([dateStr, note]) => {
              const noteDate = new Date(dateStr);
              return noteDate.getMonth() === currentDate.getMonth() && 
                     noteDate.getFullYear() === currentDate.getFullYear() &&
                     note.length > 0;
            })
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([dateStr, note]) => (
              <View key={dateStr} className="p-3 mb-3 rounded-lg bg-primary-25">
                <Text className="mb-1 font-medium text-brand-text">
                  {formatShortDate(dateStr)}
                </Text>
                <Text className="text-sm text-secondary-700">{note}</Text>
              </View>
            ))}
          {Object.entries(dailyNotes).filter(([dateStr, note]) => {
            const noteDate = new Date(dateStr);
            return noteDate.getMonth() === currentDate.getMonth() && 
                   noteDate.getFullYear() === currentDate.getFullYear() &&
                   note.length > 0;
          }).length === 0 && (
            <Text className="py-4 text-sm text-center text-secondary-600">
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
      <View className="p-3 mb-4 rounded-lg border bg-surface border-border-light">
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
        <View className="items-center p-8 rounded-xl border bg-surface border-border-light">
          <Text className="mb-4 text-6xl">📅</Text>
          <Text className="mb-2 text-lg font-bold text-brand-text">
            {searchQuery ? 'Aucun résultat' : 'Aucune période enregistrée'}
          </Text>
          <Text className="text-center text-secondary-600">
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
                  isSelected ? 'shadow-lg border-primary-500' : 'shadow-sm border-border-light'
                }`}
              >
                {/* Main Period Card */}
                <View className="p-4">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View className={`w-4 h-4 rounded-full mr-3 ${getFlowIntensityColor(period.flowIntensity)}`} />
                      <View>
                        <Text className="text-base font-bold text-brand-text">
                          {formatShortDate(period.startDate)}
                        </Text>
                        <Text className="text-sm text-secondary-600">
                          Il y a {daysSince} jours
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-medium text-brand-text">
                        {getPeriodDuration(period)} jour{getPeriodDuration(period) > 1 ? 's' : ''}
                      </Text>
                      <Text className="text-sm text-secondary-600">
                        {getFlowIntensityLabel(period.flowIntensity)}
                      </Text>
                    </View>
                  </View>

                  {period.notes && (
                    <View className="p-3 mb-3 rounded-lg bg-primary-50">
                      <Text className="text-sm text-primary-700">{period.notes}</Text>
                    </View>
                  )}

                  {/* Quick Stats */}
                  <View className="flex-row justify-between pt-3 border-t border-border-light">
                    <View className="items-center">
                      <Text className="font-medium text-brand-text">
                        {period.cycleLength || 28}j
                      </Text>
                      <Text className="text-xs text-secondary-600">Cycle</Text>
                    </View>
                    <View className="items-center">
                      <Text className="font-medium text-brand-text">
                        {period.isRegular ? '✅' : '⚠️'}
                      </Text>
                      <Text className="text-xs text-secondary-600">
                        {period.isRegular ? 'Régulier' : 'Irrégulier'}
                      </Text>
                    </View>
                    <TouchableOpacity className="items-center">
                      <Ionicons 
                        name={isSelected ? "chevron-up" : "chevron-down"} 
                        size={16} 
                        color="#A99985" 
                      />
                      <Text className="text-xs text-secondary-600">Détails</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Expanded Details */}
                {isSelected && (
                  <View className="px-4 pb-4 border-t border-border-light bg-primary-25">
                    <View className="pt-3 space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-secondary-600">Date de fin estimée</Text>
                        <Text className="font-medium text-brand-text">
                          {(() => {
                            const startDate = new Date(period.startDate);
                            const endDate = new Date(startDate.getTime() + (getPeriodDuration(period) - 1) * 24 * 60 * 60 * 1000);
                            return formatShortDate(endDate.toISOString());
                          })()}
                        </Text>
                      </View>
                      
                      <View className="flex-row justify-between">
                        <Text className="text-secondary-600">Durée du cycle</Text>
                        <Text className="font-medium text-brand-text">
                          {period.cycleLength || 28} jours
                        </Text>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-secondary-600">Enregistré le</Text>
                        <Text className="font-medium text-brand-text">
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
        <View className="items-center p-8 rounded-xl border bg-surface border-border-light">
          <Text className="mb-4 text-4xl">🔮</Text>
          <Text className="mb-2 text-lg font-bold text-brand-text">Prédictions non disponibles</Text>
          <Text className="text-center text-secondary-600">
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
        <View className="p-4 rounded-xl border bg-surface border-border-light">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-brand-text">Prédictions</Text>
            <View className="flex-row items-center">
              <View className="mr-2 w-2 h-2 rounded-full bg-success-500" />
              <Text className="font-medium text-success-600">{pred.confidence}% fiables</Text>
            </View>
          </View>
          
          <Text className="text-sm text-secondary-600">
            Basées sur l'analyse de votre historique personnel
          </Text>
        </View>

        {/* Next Period Prediction */}
        <View className="p-4 rounded-xl border bg-surface border-border-light">
          <View className="flex-row items-center mb-3">
            <View className="justify-center items-center mr-3 w-12 h-12 bg-pink-100 rounded-full">
              <Text className="text-2xl">🩸</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-brand-text">Prochaines règles</Text>
              <Text className="text-secondary-600">
                Dans {pred.daysUntilNextPeriod} jour{pred.daysUntilNextPeriod > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-medium text-brand-text">
            {formatDate(pred.nextPeriodStart)}
          </Text>
        </View>

        {/* Next Ovulation Prediction */}
        <View className="p-4 rounded-xl border bg-surface border-border-light">
          <View className="flex-row items-center mb-3">
            <View className="justify-center items-center mr-3 w-12 h-12 rounded-full bg-accent-100">
              <Text className="text-2xl">🥚</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-brand-text">Prochaine ovulation</Text>
              <Text className="text-secondary-600">
                Dans {pred.daysUntilOvulation} jour{pred.daysUntilOvulation > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          <Text className="text-lg font-medium text-brand-text">
            {formatDate(pred.nextOvulation)}
          </Text>
        </View>

        {/* Current Cycle Info */}
        <View className="p-4 rounded-xl border bg-surface border-border-light">
          <Text className="mb-3 text-base font-bold text-brand-text">Cycle actuel</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Jour du cycle</Text>
              <Text className="font-medium text-brand-text">Jour {pred.currentCycleDay}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-secondary-600">Phase actuelle</Text>
              <Text className="font-medium capitalize text-brand-text">{pred.currentCycleCharacteristics}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderComparisonView = () => {
    if (!comparison) {
      return (
        <View className="items-center p-8 rounded-xl border bg-surface border-border-light">
          <Text className="mb-4 text-4xl">📊</Text>
          <Text className="mb-2 text-lg font-bold text-brand-text">Comparaison non disponible</Text>
          <Text className="text-center text-secondary-600">
            Enregistrez au moins 2 cycles pour voir les comparaisons
          </Text>
        </View>
      );
    }

    return (
      <View className="space-y-4">
        {/* Insights */}
        {comparison.insights.length > 0 && (
          <View className="p-4 rounded-xl border bg-surface border-border-light">
            <Text className="mb-3 text-base font-bold text-brand-text">Insights</Text>
            <View className="space-y-2">
              {comparison.insights.map((insight, index) => (
                <Text key={index} className="text-sm leading-5 text-secondary-700">
                  {insight}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Trends */}
        {comparison.trends.length > 0 && (
          <View className="p-4 rounded-xl border bg-surface border-border-light">
            <Text className="mb-3 text-base font-bold text-brand-text">Tendances</Text>
            <View className="space-y-3">
              {comparison.trends.map((trend, index) => (
                <View key={index} className="flex-row items-center">
                  <View className={`w-3 h-3 rounded-full mr-3 ${
                    trend.trend === 'increasing' ? 'bg-accent-500' :
                    trend.trend === 'decreasing' ? 'bg-primary-500' : 'bg-success-500'
                  }`} />
                  <View className="flex-1">
                    <Text className="font-medium text-brand-text">{trend.metric}</Text>
                    <Text className="text-sm text-secondary-600">{trend.description}</Text>
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
        <View className="p-4 rounded-xl border bg-surface border-border-light">
          <Text className="mb-3 text-base font-bold text-brand-text">Moyennes</Text>
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
        <View className="p-4 rounded-xl border bg-surface border-border-light">
          <Text className="mb-3 text-base font-bold text-brand-text">
            Cycles analysés ({comparison.cycles.length})
          </Text>
          <View className="space-y-3">
            {comparison.cycles.map((cycle, index) => (
              <View key={index} className="flex-row justify-between items-center p-3 rounded-lg bg-primary-25">
                <View>
                  <Text className="font-medium text-brand-text">
                    Cycle #{cycle.cycleNumber}
                  </Text>
                  <Text className="text-sm text-secondary-600">
                    {formatShortDate(cycle.startDate)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-medium text-brand-text">
                    {cycle.cycleLength}j / {cycle.periodLength}j
                  </Text>
                  <Text className="text-sm text-secondary-600">
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
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1">
            <Text className="mb-1 text-2xl font-bold text-brand-text">
              Historique menstruel
            </Text>
            <Text className="text-sm text-secondary-600">
              Analyse complète de votre cycle
            </Text>
          </View>
          {onClose && (
            <TouchableOpacity
              onPress={onClose}
              className="justify-center items-center w-10 h-10 rounded-full border shadow-sm bg-surface border-border-light"
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
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1">
                <Text className="mb-1 text-xl font-bold text-brand-text">
                  Ajouter une note
                </Text>
                <Text className="text-sm text-secondary-600">
                  {selectedCalendarDate && formatDate(selectedCalendarDate.toISOString())}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                className="justify-center items-center w-10 h-10 rounded-full border shadow-sm bg-surface border-border-light"
              >
                <Ionicons name="close" size={20} color="#8B5A3C" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
              <Text className="mb-3 font-medium text-brand-text">Comment vous sentez-vous aujourd'hui ?</Text>
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
            <View className="p-4 mb-4 rounded-xl border shadow-sm bg-surface border-border-light">
              <Text className="mb-3 font-medium text-brand-text">Suggestions rapides</Text>
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
                    className="px-3 py-2 mr-2 mb-2 rounded-full bg-primary-100"
                  >
                    <Text className="text-sm text-primary-700">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="px-4 pt-2 pb-4 border-t border-border-light bg-surface">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setNoteModalVisible(false)}
                className="flex-1 items-center py-3 rounded-lg bg-border-light"
              >
                <Text className="font-medium text-secondary-600">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveDailyNote}
                className="flex-1 items-center py-3 rounded-lg bg-primary-500"
              >
                <Text className="font-medium text-white">Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default PeriodHistoryScreen;
