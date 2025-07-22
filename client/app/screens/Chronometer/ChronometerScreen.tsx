import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const ChronometerScreen = () => {
  const [time, setTime] = useState(0); // Commence à 00:00
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const handleStartStop = (): void => {
    setIsActive(!isActive);
  };

  const handleReset = (): void => {
    setIsActive(false);
    setTime(0);
  };

  return (
      <SafeAreaView className="flex-1 bg-brand-cream justify-center items-center">
        <Text className="text-sm text-brand-dark-surface mb-4">Chronomètre</Text>
        <Text className="text-8xl font-bold text-brand-dark-bg mb-20">
          {formatTime(time)}
        </Text>

        <View className="flex-row w-full justify-around">
          <TouchableOpacity
              onPress={handleReset}
              className="bg-brand-dark-gray-btn w-24 h-24 rounded-full justify-center items-center"
          >
            <Text className="text-brand-dark-text text-lg">Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
              onPress={handleStartStop}
              className="bg-brand-dark-red-btn w-24 h-24 rounded-full justify-center items-center"
          >
            <Text className="text-brand-dark-text text-lg">
              {isActive ? 'Pause' : 'Démarrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

  );
};

export default ChronometerScreen;
