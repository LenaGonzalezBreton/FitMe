import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Svg, { Path, Circle, Line, G, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

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
  periodLength: number;
}

const HormoneGraph: React.FC<HormoneGraphProps> = ({ data, currentDay, cycleLength, periodLength }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<{hormone: string, value: number, x: number, y: number} | null>(null);
  
  // Safety check for data
  if (!data || data.length === 0 || !cycleLength) {
    return (
      <View className="p-4 rounded-xl border shadow-sm bg-surface border-border-light">
        <Text className="mb-4 text-lg font-bold text-brand-text">Courbes hormonales</Text>
        <View className="justify-center items-center h-48">
          <Text className="text-secondary-500">Chargement des données...</Text>
        </View>
      </View>
    );
  }
  
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

  // Get current day coordinates (ensure valid index)
  const currentDayIndex = Math.max(0, Math.min(currentDay - 1, data.length - 1));
  const currentEstrogen = estrogenCoords[currentDayIndex];
  const currentProgesterone = progesteroneCoords[currentDayIndex];
  const currentTestosterone = testosteroneCoords[currentDayIndex];

  // Phase markers based on real cycle data
  const getPhaseMarkers = () => {
    const markers = [];
    const ovulationDay = Math.max(1, cycleLength - 14); // Ovulation typically 14 days before next cycle
    const follicularEndDay = Math.max(periodLength, ovulationDay - 2); // Follicular phase ends ~2 days before ovulation
    const lutealStartDay = Math.min(cycleLength, ovulationDay + 2); // Luteal phase starts ~2 days after ovulation
    
    const stepX = (GRAPH_WIDTH - PADDING * 2) / (cycleLength - 1);
    
    // Menstrual phase (day 1 to periodLength)
    markers.push({
      x: PADDING,
      label: 'Menstruelle',
      color: '#E91E63'
    });
    
    // Follicular phase (periodLength + 1 to follicularEndDay) 
    if (follicularEndDay > periodLength) {
      markers.push({
        x: PADDING + (periodLength * stepX),
        label: 'Folliculaire', 
        color: '#4CAF50'
      });
    }
    
    // Ovulation phase (ovulationDay - 2 to ovulationDay + 2)
    markers.push({
      x: PADDING + ((ovulationDay - 2) * stepX),
      label: 'Ovulation',
      color: '#FF9800'
    });
    
    // Luteal phase (lutealStartDay to cycleLength)
    if (lutealStartDay < cycleLength) {
      markers.push({
        x: PADDING + (lutealStartDay * stepX),
        label: 'Lutéale',
        color: '#9C27B0'
      });
    }
    
    return markers;
  };

  const phaseMarkers = getPhaseMarkers();

  const handleDotPress = (hormone: string, value: number, x: number, y: number) => {
    const dayData = data[currentDay - 1];
    if (dayData) {
      setTooltipData({ 
        hormone: `Jour ${currentDay}`, 
        value: 0, // We'll show all hormone values in tooltip 
        x, 
        y 
      });
      setShowTooltip(true);
    }
  };

  return (
    <View className="p-4 rounded-xl border shadow-sm bg-surface border-border-light">
      <Text className="mb-4 text-lg font-bold text-brand-text">Courbes hormonales</Text>
      
      <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT + 60}>
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

        {/* Current day indicators - subtle and elegant */}
        {currentEstrogen && (
          <Circle
            cx={currentEstrogen.x}
            cy={currentEstrogen.y}
            r="4"
            fill="#E91E63"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.9"
          />
        )}
        
        {currentProgesterone && (
          <Circle
            cx={currentProgesterone.x}
            cy={currentProgesterone.y}
            r="4"
            fill="#2196F3"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.9"
          />
        )}
        
        {currentTestosterone && (
          <Circle
            cx={currentTestosterone.x}
            cy={currentTestosterone.y}
            r="4"
            fill="#4CAF50"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.9"
          />
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
        {/* Invisible clickable area for current day */}
        {currentEstrogen && (
          <TouchableOpacity
            onPress={() => handleDotPress('Jour ' + currentDay, 0, currentEstrogen.x, currentEstrogen.y)}
            style={{ 
              position: 'absolute', 
              left: currentEstrogen.x - 20, 
              top: 0,
              width: 40, 
              height: GRAPH_HEIGHT,
              backgroundColor: 'transparent'
            }}
          />
        )}
        {/* Y-axis labels (Hormone levels) */}
        <G>
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = GRAPH_HEIGHT - PADDING - (value * stepY);
            return (
              <SvgText
                key={`y-${index}`}
                x={PADDING - 5}
                y={y + 3}
                fontSize="10"
                fill="#9CA3AF"
                textAnchor="end"
              >
                {value}%
              </SvgText>
            );
          })}
        </G>

        {/* X-axis labels (Days) */}
        <G>
          {(() => {
            const labelDays = [];
            const step = Math.max(1, Math.floor(cycleLength / 6)); // Show ~6 labels max
            for (let day = 1; day <= cycleLength; day += step) {
              labelDays.push(day);
            }
            if (labelDays[labelDays.length - 1] !== cycleLength) {
              labelDays.push(cycleLength);
            }
            
            return labelDays.map((day) => {
              const x = PADDING + ((day - 1) * stepX);
              return (
                <SvgText
                  key={`x-${day}`}
                  x={x}
                  y={GRAPH_HEIGHT - PADDING + 15}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="middle"
                >
                  J{day}
                </SvgText>
              );
            });
          })()}
        </G>
      </Svg>

      {/* Axis labels */}
      <View className="flex-row justify-between items-center mt-1 mb-3">
        <Text className="text-xs text-secondary-500">Jours du cycle</Text>
        <Text className="text-xs text-secondary-500">Niveau hormonal (%)</Text>
      </View>

      {/* Legend */}
      <View className="flex-row justify-between mt-2">
        <View className="flex-row items-center">
          <View className="mr-2 w-4 h-1 bg-pink-500 rounded" />
          <Text className="text-xs text-secondary-600">Œstrogène</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-2 w-4 h-1 bg-blue-500 rounded" />
          <Text className="text-xs text-secondary-600">Progestérone</Text>
        </View>
        <View className="flex-row items-center">
          <View className="mr-2 w-4 h-1 bg-green-500 rounded" />
          <Text className="text-xs text-secondary-600">Testostérone</Text>
        </View>
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
              <View className="p-4 mx-4 rounded-xl border shadow-lg bg-surface border-border-light">
                <Text className="mb-3 text-lg font-bold text-center text-brand-text">
                  {tooltipData.hormone}
                </Text>
                
                {/* Hormone values for current day */}
                {data[currentDay - 1] && (
                  <View className="space-y-2">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="mr-2 w-3 h-3 bg-pink-500 rounded-full" />
                        <Text className="text-sm text-brand-text">Œstrogène</Text>
                      </View>
                      <Text className="text-sm font-bold text-pink-600">
                        {Math.round(data[currentDay - 1].estrogen)}%
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="mr-2 w-3 h-3 bg-blue-500 rounded-full" />
                        <Text className="text-sm text-brand-text">Progestérone</Text>
                      </View>
                      <Text className="text-sm font-bold text-blue-600">
                        {Math.round(data[currentDay - 1].progesterone)}%
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="mr-2 w-3 h-3 bg-green-500 rounded-full" />
                        <Text className="text-sm text-brand-text">Testostérone</Text>
                      </View>
                      <Text className="text-sm font-bold text-green-600">
                        {Math.round(data[currentDay - 1].testosterone)}%
                      </Text>
                    </View>
                  </View>
                )}
                
                <Text className="mt-3 text-xs text-center text-secondary-500">
                  Niveaux hormonaux approximatifs
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
