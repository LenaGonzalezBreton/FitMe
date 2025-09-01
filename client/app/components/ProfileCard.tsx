import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ProfileCardProps {
  firstName: string;
  email: string;
  profileImageUrl?: string;
  isEditing: boolean;
  onEditToggle: () => void;
  onImagePick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  firstName,
  email,
  profileImageUrl,
  isEditing,
  onEditToggle,
  onImagePick,
}) => {
  return (
    <View className="bg-white rounded-xl p-6 shadow-sm">
      {/* Profile Image */}
      <View className="items-center mb-6">
        <TouchableOpacity onPress={onImagePick} className="relative">
          {profileImageUrl ? (
            <Image
              source={{ uri: profileImageUrl }}
              className="w-24 h-24 rounded-full"
              style={{ backgroundColor: '#f3f4f6' }}
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="person" size={40} color="#9CA3AF" />
            </View>
          )}
          <View className="absolute -bottom-2 -right-2 bg-primary-500 rounded-full p-2">
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-brand-dark-bg mb-1">
          {firstName || 'Utilisateur'}
        </Text>
        <Text className="text-brand-dark-surface">
          {email}
        </Text>
      </View>

      {/* Quick Actions */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onEditToggle}
          className="flex-1 bg-primary-500 py-3 rounded-lg flex-row items-center justify-center"
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "create-outline"} 
            size={16} 
            color="white" 
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-medium">
            {isEditing ? 'Sauvegarder' : 'Modifier'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-brand-brown py-3 px-4 rounded-lg">
          <Ionicons name="settings-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileCard;
