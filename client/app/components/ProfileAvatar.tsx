import React from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileAvatarProps {
  imageUri?: string;
  size?: number;
  loading?: boolean;
  onPress?: () => void;
  showEditIcon?: boolean;
  firstName?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  imageUri,
  size = 96,
  loading = false,
  onPress,
  showEditIcon = true,
  firstName = '',
}) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(firstName);

  return (
    <View className="items-center">
      <TouchableOpacity 
        onPress={onPress} 
        className="relative"
        disabled={loading}
        style={{ width: size, height: size }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ 
              width: size, 
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#f3f4f6'
            }}
            className="border-2 border-primary-200"
          />
        ) : (
          <View 
            style={{ 
              width: size, 
              height: size,
              borderRadius: size / 2
            }}
            className="bg-primary-100 items-center justify-center border-2 border-primary-200"
          >
            {initials ? (
              <Text 
                className="font-bold text-primary-700"
                style={{ fontSize: size * 0.35 }}
              >
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={size * 0.4} color="#8B5A3C" />
            )}
          </View>
        )}
        
        {showEditIcon && (
          <View 
            className="absolute bg-primary-500 rounded-full items-center justify-center shadow-sm"
            style={{
              bottom: -2,
              right: -2,
              width: size * 0.25,
              height: size * 0.25,
            }}
          >
            <Ionicons name="camera" size={size * 0.15} color="white" />
          </View>
        )}
        
        {loading && (
          <View 
            className="absolute bg-black bg-opacity-30 items-center justify-center"
            style={{ 
              width: size, 
              height: size,
              borderRadius: size / 2
            }}
          >
            <ActivityIndicator color="white" size="small" />
          </View>
        )}
      </TouchableOpacity>
      
      {onPress && (
        <Text className="text-xs text-brand-dark-surface mt-2">
          Appuyez pour changer
        </Text>
      )}
    </View>
  );
};

export default ProfileAvatar;
