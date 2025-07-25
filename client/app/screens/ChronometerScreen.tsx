import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, AppState } from 'react-native';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const ChronometerScreen = () => {
  const [time, setTime] = useState(30 * 60);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(t => t - 1);
      }, 1000);
    } else if (!isActive || time === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, time]);

  const handleStartStop = (): void => {
      if(time === 0) {
        setTime(30 * 60);
        setIsActive(false);
      } else {
        setIsActive(!isActive);
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background justify-center items-center">
      <Text className="text-sm text-text-secondary mb-4">Chronomètre</Text>
      <Text className="text-8xl font-bold text-brand-text mb-20">{formatTime(time)}</Text>
      <View className="flex-row w-full justify-around">
        <TouchableOpacity className="bg-surface border border-border w-24 h-24 rounded-full justify-center items-center">
          <Text className="text-brand-text text-lg">Tour</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={handleStartStop}
            className="bg-error w-24 h-24 rounded-full justify-center items-center">
          <Text className="text-white text-lg">{time === 0 ? "Recommencer" : (isActive ? 'Arrêter' : 'Démarrer')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChronometerScreen; 