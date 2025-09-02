import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { usePeriods } from '../../hooks/usePeriods';
import { Ionicons } from '@expo/vector-icons';
import { Period } from '../../types';

interface PeriodHistoryScreenProps {
  onClose?: () => void;
}

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - 32;
const DAY_SIZE = (CALENDAR_WIDTH - 48) / 7; // 7 days, with some padding

const PeriodHistoryScreen = ({ onClose }: PeriodHistoryScreenProps) => {
  const { periods, loading, refreshPeriods } = usePeriods();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<any | null>(null);

  useEffect(() => {
    refreshPeriods();
  }, []);

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
      // Calculate end date based on period length (default 5 days if not specified)
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

  const getFlowIntensityColor = (period: any): string => {
    if (!period.flowIntensity) return 'bg-pink-300';
    
    switch (period.flowIntensity) {
      case 1: return 'bg-pink-200';
      case 2: return 'bg-pink-300';
      case 3: return 'bg-pink-400';
      case 4: return 'bg-pink-500';
      case 5: return 'bg-pink-600';
      default: return 'bg-pink-400';
    }
  };

  const renderCalendar = () => {
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

      days.push(
        <TouchableOpacity
          key={day}
          style={{ width: DAY_SIZE, height: DAY_SIZE }}
          className="items-center justify-center"
          onPress={() => period && setSelectedPeriod(period)}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              isPeriod
                ? period
                  ? getFlowIntensityColor(period)
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
        </TouchableOpacity>
      );
    }

    return days;
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPeriodDuration = (period: any): number => {
    // Use periodLength from backend response, default to 5 days
    return period.periodLength || 5;
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F5EFE6" />
      
      {/* Header */}
      <View className="px-4 pt-4 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-brand-text mb-1">Historique des règles</Text>
            <Text className="text-sm text-secondary-600">
              Suivez votre cycle menstruel au fil du temps
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

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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
            {renderCalendar()}
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
            </View>
          </View>
        </View>

        {/* Period Details */}
        {selectedPeriod && (
          <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-4">
            <Text className="text-lg font-bold text-brand-text mb-4">Détails de la période</Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-secondary-600">Date de début</Text>
                <Text className="text-brand-text font-medium">
                  {formatDate(selectedPeriod.startDate)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-secondary-600">Date de fin estimée</Text>
                <Text className="text-brand-text font-medium">
                  {(() => {
                    const startDate = new Date(selectedPeriod.startDate);
                    const periodLength = selectedPeriod.periodLength || 5;
                    const endDate = new Date(startDate.getTime() + (periodLength - 1) * 24 * 60 * 60 * 1000);
                    return formatDate(endDate.toISOString());
                  })()}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-secondary-600">Durée</Text>
                <Text className="text-brand-text font-medium">
                  {getPeriodDuration(selectedPeriod)} jour{getPeriodDuration(selectedPeriod) > 1 ? 's' : ''}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-secondary-600">Intensité</Text>
                <Text className="text-brand-text font-medium">
                  {getFlowIntensityLabel(selectedPeriod.flowIntensity)}
                </Text>
              </View>
              
              {selectedPeriod.notes && (
                <View>
                  <Text className="text-secondary-600 mb-2">Notes</Text>
                  <Text className="text-brand-text">{selectedPeriod.notes}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Recent Periods List */}
        <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-6">
          <Text className="text-lg font-bold text-brand-text mb-4">Périodes récentes</Text>
          
          {periods.length === 0 ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">📅</Text>
              <Text className="text-brand-text font-medium mb-2">Aucune période enregistrée</Text>
              <Text className="text-secondary-600 text-center text-sm">
                Commencez à enregistrer vos règles pour suivre votre cycle
              </Text>
            </View>
          ) : (
            <View className="space-y-3">
              {periods.slice(0, 5).map((period, index) => (
                <TouchableOpacity
                  key={period.id}
                  onPress={() => setSelectedPeriod(period)}
                  className={`p-3 rounded-lg border ${
                    selectedPeriod?.id === period.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-border bg-surface'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-brand-text font-medium">
                        {formatDate(period.startDate)}
                      </Text>
                      <Text className="text-secondary-600 text-sm">
                        {getPeriodDuration(period)} jour{getPeriodDuration(period) > 1 ? 's' : ''} • {getFlowIntensityLabel(period.flowIntensity)}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={selectedPeriod?.id === period.id ? "#8B5A3C" : "#A99985"} 
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Statistics */}
        {periods.length > 0 && (
          <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light mb-6">
            <Text className="text-lg font-bold text-brand-text mb-4">Statistiques</Text>
            
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary-500">{periods.length}</Text>
                <Text className="text-sm text-secondary-600">Périodes enregistrées</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-2xl font-bold text-accent-500">
                  {periods.length > 0 
                    ? Math.round(periods.reduce((sum, period) => sum + getPeriodDuration(period), 0) / periods.length)
                    : 0
                  }
                </Text>
                <Text className="text-sm text-secondary-600">Durée moyenne (jours)</Text>
              </View>
              
              <View className="items-center">
                <Text className="text-2xl font-bold text-success-500">
                  {periods.length > 1 
                    ? Math.round(periods.slice(0, -1).reduce((sum, period, index) => {
                        const nextPeriod = periods[index + 1];
                        const cycleLength = Math.ceil(
                          (new Date(period.startDate).getTime() - new Date(nextPeriod.startDate).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        return sum + cycleLength;
                      }, 0) / (periods.length - 1))
                    : 0
                  }
                </Text>
                <Text className="text-sm text-secondary-600">Cycle moyen (jours)</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PeriodHistoryScreen;
