import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import PagerView from 'react-native-pager-view';
import HomeScreen from '../screens/HomeScreen';
import ExercicesScreen from '../screens/ExercicesScreen';
import ProgramScreen from '../screens/ProgramScreen';
import ChronometerScreen from '../screens/ChronometerScreen';
import { NavigationProp } from '@react-navigation/native';

interface MainPagerProps {
  navigation: NavigationProp<any, any>;
}

const MainPager: React.FC<MainPagerProps> = ({ navigation }) => {
  const [page, setPage] = useState<number>(0);
  const pages: JSX.Element[] = [
    <HomeScreen navigation={navigation} />,
    <ExercicesScreen navigation={navigation} />,
    <ProgramScreen navigation={navigation} />,
    <ChronometerScreen />,
  ];

  return (
    <View style={{ flex: 1 }}>
      <PagerView
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={e => setPage(e.nativeEvent.position)}
      >
        {pages.map((p, index) => (
          <View key={index}>{p}</View>
        ))}
      </PagerView>
      <View className="absolute bottom-8 left-0 right-0 flex-row justify-center">
        {pages.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 rounded-full mx-1 ${
              page === index ? 'bg-white' : 'bg-gray-500'
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default MainPager; 