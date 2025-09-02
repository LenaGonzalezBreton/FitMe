import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path, Circle, Line, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const GRAPH_WIDTH = width - 40;
const GRAPH_HEIGHT = 200;
const PADDING = 20;

interface HormoneData {
  day: number;
  estrogen: number;
  progesterone: number;
  testosterone: number;
}

interface HormoneGraphProps {
  data: HormoneData[];
  currentDay: number;
  cycleLength: number;
}

const HormoneGraph: React.FC<HormoneGraphProps> = ({ data, currentDay, cycleLength }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<{hormone: string, value: number, x: number, y: number} | null>(null);
  
  const maxValue = 100;
  const stepX = (GRAPH_WIDTH - PADDING * 2) / (cycleLength - 1);
  const stepY = (GRAPH_HEIGHT - PADDING * 2) / maxValue;

  // Convert data points to SVG coordinates
  const getCoordinates = (values: number[]) => {
    return values.map((value, index) => {
      const x = PADDING + index * stepX;
      const y = GRAPH_HEIGHT - PADDING - (value * stepY);
      return { x, y };
    });
  };

  // Create smooth path from coordinates
  const createPath = (coordinates: { x: number; y: number }[]) => {
    if (coordinates.length < 2) return '';
    
    let path = `M ${coordinates[0].x} ${coordinates[0].y}`;
    
    for (let i = 1; i < coordinates.length; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      const next = coordinates[i + 1];
      
      if (next) {
        // Smooth curve using quadratic bezier
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = curr.x - (next.x - curr.x) / 2;
        const cp2y = curr.y;
        
        path += ` Q ${cp1x} ${cp1y} ${curr.x} ${curr.y}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    return path;
  };

  const estrogenCoords = getCoordinates(data.map(d => d.estrogen));
  const progesteroneCoords = getCoordinates(data.map(d => d.progesterone));
  const testosteroneCoords = getCoordinates(data.map(d => d.testosterone));

  const estrogenPath = createPath(estrogenCoords);
  const progesteronePath = createPath(progesteroneCoords);
  const testosteronePath = createPath(testosteroneCoords);

  // Get current day coordinates
  const currentDayIndex = currentDay - 1;
  const currentEstrogen = estrogenCoords[currentDayIndex];
  const currentProgesterone = progesteroneCoords[currentDayIndex];
  const currentTestosterone = testosteroneCoords[currentDayIndex];

  // Phase markers
  const getPhaseMarkers = () => {
    const markers = [];
    const phaseLengths = {
      menstrual: 5,
      follicular: 9,
      ovulation: 1,
      luteal: 13
    };
    
    let currentX = PADDING;
    
    // Menstrual phase
    markers.push({
      x: currentX,
      label: 'Menstruelle',
      color: '#E91E63'
    });
    currentX += (phaseLengths.menstrual / cycleLength) * (GRAPH_WIDTH - PADDING * 2);
    
    // Follicular phase
    markers.push({
      x: currentX,
      label: 'Folliculaire',
      color: '#4CAF50'
    });
    currentX += (phaseLengths.follicular / cycleLength) * (GRAPH_WIDTH - PADDING * 2);
    
    // Ovulation
    markers.push({
      x: currentX,
      label: 'Ovulation',
      color: '#FF9800'
    });
    currentX += (phaseLengths.ovulation / cycleLength) * (GRAPH_WIDTH - PADDING * 2);
    
    // Luteal phase
    markers.push({
      x: currentX,
      label: 'Lutéale',
      color: '#9C27B0'
    });
    
    return markers;
  };

  const phaseMarkers = getPhaseMarkers();

  const handleDotPress = (hormone: string, value: number, x: number, y: number) => {
    setTooltipData({ hormone, value, x, y });
    setShowTooltip(true);
  };

  return (
    <View className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
      <Text className="text-lg font-bold text-brand-text mb-4">Courbes hormonales</Text>
      
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT + 40}>
        <Defs>
          {/* Estrogen gradient */}
          <LinearGradient id="estrogenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#E91E63" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#E91E63" stopOpacity="0" />
          </LinearGradient>
          
          {/* Progesterone gradient */}
          <LinearGradient id="progesteroneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#2196F3" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#2196F3" stopOpacity="0" />
          </LinearGradient>
          
          {/* Testosterone gradient */}
          <LinearGradient id="testosteroneGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#4CAF50" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        <G stroke="#E5E7EB" strokeWidth="1" opacity="0.5">
          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = GRAPH_HEIGHT - PADDING - (value * stepY);
            return (
              <Line
                key={`h-${index}`}
                x1={PADDING}
                y1={y}
                x2={GRAPH_WIDTH - PADDING}
                y2={y}
              />
            );
          })}
          
          {/* Vertical grid lines for phases */}
          {phaseMarkers.map((marker, index) => (
            <Line
              key={`v-${index}`}
              x1={marker.x}
              y1={PADDING}
              x2={marker.x}
              y2={GRAPH_HEIGHT - PADDING}
            />
          ))}
        </G>

        {/* Hormone curves */}
        <Path
          d={estrogenPath}
          stroke="#E91E63"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <Path
          d={progesteronePath}
          stroke="#2196F3"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <Path
          d={testosteronePath}
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current day indicators - clickable */}
        {currentEstrogen && (
          <TouchableOpacity
            onPress={() => handleDotPress('Œstrogène', data[currentDayIndex]?.estrogen || 0, currentEstrogen.x, currentEstrogen.y)}
            style={{ position: 'absolute', left: currentEstrogen.x - 8, top: currentEstrogen.y - 8 }}
          >
            <Circle
              cx={currentEstrogen.x}
              cy={currentEstrogen.y}
              r="6"
              fill="#E91E63"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </TouchableOpacity>
        )}
        
        {currentProgesterone && (
          <TouchableOpacity
            onPress={() => handleDotPress('Progestérone', data[currentDayIndex]?.progesterone || 0, currentProgesterone.x, currentProgesterone.y)}
            style={{ position: 'absolute', left: currentProgesterone.x - 8, top: currentProgesterone.y - 8 }}
          >
            <Circle
              cx={currentProgesterone.x}
              cy={currentProgesterone.y}
              r="6"
              fill="#2196F3"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </TouchableOpacity>
        )}
        
        {currentTestosterone && (
          <TouchableOpacity
            onPress={() => handleDotPress('Testostérone', data[currentDayIndex]?.testosterone || 0, currentTestosterone.x, currentTestosterone.y)}
            style={{ position: 'absolute', left: currentTestosterone.x - 8, top: currentTestosterone.y - 8 }}
          >
            <Circle
              cx={currentTestosterone.x}
              cy={currentTestosterone.y}
              r="6"
              fill="#4CAF50"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          </TouchableOpacity>
        )}

        {/* Current day line */}
        {currentEstrogen && (
          <Line
            x1={currentEstrogen.x}
            y1={PADDING}
            x2={currentEstrogen.x}
            y2={GRAPH_HEIGHT - PADDING}
            stroke="#8B5A3C"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        )}
      </Svg>

      {/* Legend */}
      <View className="flex-row justify-between mt-4">
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-pink-500 rounded mr-2" />
          <Text className="text-xs text-secondary-600">Œstrogène</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-blue-500 rounded mr-2" />
          <Text className="text-xs text-secondary-600">Progestérone</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-1 bg-green-500 rounded mr-2" />
          <Text className="text-xs text-secondary-600">Testostérone</Text>
        </View>
      </View>

      {/* Phase markers */}
      <View className="flex-row justify-between mt-2">
        {phaseMarkers.map((marker, index) => (
          <View key={index} className="items-center">
            <View 
              className="w-2 h-2 rounded-full mb-1"
              style={{ backgroundColor: marker.color }}
            />
            <Text className="text-xs text-secondary-500 text-center">
              {marker.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Tooltip Modal */}
      <Modal
        visible={showTooltip}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setShowTooltip(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {tooltipData && (
              <View className="bg-surface rounded-xl p-4 shadow-lg border border-border-light mx-4">
                <Text className="text-lg font-bold text-brand-text mb-2">
                  Jour {currentDay}
                </Text>
                <Text className="text-base text-brand-text mb-1">
                  {tooltipData.hormone}
                </Text>
                <Text className="text-2xl font-bold text-primary-500">
                  {Math.round(tooltipData.value)}%
                </Text>
                <Text className="text-xs text-secondary-500 mt-1">
                  Niveau actuel
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HormoneGraph;
