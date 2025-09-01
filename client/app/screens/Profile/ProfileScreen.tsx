import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { useCycle } from '../../hooks/useCycle';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from '../../components/ProfileAvatar';

interface ProfileScreenProps {
  navigation: NavigationProp<any, any>;
}

interface WorkoutSession {
  id: string;
  date: string;
  programTitle: string;
  phase: string;
  phaseLabel: string;
  duration: number;
  exerciseCount: number;
  completed: boolean;
}

interface ProfileData {
  firstName: string;
  email: string;
  profileImageUrl?: string;
  birthDate?: string;
  objective?: string;
  experienceLevel?: string;
}

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { logout } = useAuth();
  const { getPhaseLabel, getPhaseEmoji } = useCycle();
  const {
    profileData,
    workoutHistory,
    loading,
    refreshProfile,
    updateProfile,
    changePassword,
    uploadProfileImage,
  } = useProfile();
  
  // Local states
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profileData);

  // Update edited profile when profile data changes
  useEffect(() => {
    setEditedProfile(profileData);
  }, [profileData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const handleSaveProfile = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editedProfile.email && !emailRegex.test(editedProfile.email)) {
      Alert.alert('Erreur', 'Format d\'email invalide');
      return;
    }

    // Check if email has changed
    const emailChanged = editedProfile.email !== profileData.email;

    if (emailChanged) {
      // Show confirmation for email change
      Alert.alert(
        'Changement d\'email',
        'Changer votre email nécessitera une nouvelle connexion. Êtes-vous sûr ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Confirmer', 
            style: 'destructive',
            onPress: () => saveProfileChanges()
          }
        ]
      );
    } else {
      saveProfileChanges();
    }
  };

  const saveProfileChanges = async () => {
    const success = await updateProfile({
      firstName: editedProfile.firstName,
      email: editedProfile.email,
    });
    
    if (success) {
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      
      // If email changed, suggest logout
      if (editedProfile.email !== profileData.email) {
        setTimeout(() => {
          Alert.alert(
            'Email modifié',
            'Votre email a été modifié. Nous vous recommandons de vous reconnecter.',
            [
              { text: 'Plus tard', style: 'cancel' },
              { text: 'Se reconnecter', onPress: logout }
            ]
          );
        }, 1000);
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    
    if (success) {
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Succès', 'Mot de passe modifié avec succès');
    }
  };

  const handlePickImage = async () => {
    Alert.alert(
      'Photo de profil',
      'Choisissez une option',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Galerie', onPress: () => pickImageFromLibrary() },
        { text: 'Appareil photo', onPress: () => takePicture() },
      ]
    );
  };

  const pickImageFromLibrary = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', 'Permission d\'accès à la galerie photo requise');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const success = await uploadProfileImage(imageUri);
        
        if (success) {
          Alert.alert('Succès', 'Photo de profil mise à jour');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la sélection de l\'image');
    }
  };

  const takePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission requise', 'Permission d\'accès à l\'appareil photo requise');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const success = await uploadProfileImage(imageUri);
        
        if (success) {
          Alert.alert('Succès', 'Photo de profil mise à jour');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de la prise de photo');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getPhaseColor = (phase: string): string => {
    switch (phase) {
      case 'MENSTRUAL':
        return 'bg-phase-menstrual-100';
      case 'FOLLICULAR':
        return 'bg-phase-follicular-100';
      case 'OVULATION':
        return 'bg-phase-ovulation-100';
      case 'LUTEAL':
        return 'bg-phase-luteal-100';
      default:
        return 'bg-secondary-100';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-3xl font-bold text-brand-text">Profil</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#8B5A3C" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Section */}
        <View className="px-6 mb-6">
          <View className="bg-surface rounded-xl p-6 shadow-sm border border-border-light">
            {/* Profile Image */}
            <View className="mb-6">
              <ProfileAvatar
                imageUri={profileData.profileImageUrl}
                firstName={profileData.firstName}
                loading={loading}
                onPress={handlePickImage}
                size={96}
                showEditIcon={true}
              />
            </View>

            {/* Profile Info */}
            <View className="space-y-4">
              {/* Name */}
              <View>
                <Text className="text-sm font-medium text-secondary-600 mb-2">Prénom</Text>
                {isEditing ? (
                  <TextInput
                    value={editedProfile.firstName}
                    onChangeText={(text) => setEditedProfile(prev => ({ ...prev, firstName: text }))}
                    className="border border-border rounded-lg px-3 py-2 text-brand-text focus:border-primary-500"
                  />
                ) : (
                  <Text className="text-lg text-brand-text">{profileData.firstName}</Text>
                )}
              </View>

              {/* Email */}
              <View>
                <Text className="text-sm font-medium text-secondary-600 mb-2">Email</Text>
                {isEditing ? (
                  <View>
                    <TextInput
                      value={editedProfile.email}
                      onChangeText={(text) => setEditedProfile(prev => ({ ...prev, email: text }))}
                      className="border border-border rounded-lg px-3 py-2 text-brand-text focus:border-primary-500"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="votre@email.com"
                    />
                    {editedProfile.email !== profileData.email && (
                      <Text className="text-xs text-warning-600 mt-1">
                        ⚠️ Changer votre email nécessitera une reconnexion
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text className="text-lg text-brand-text">{profileData.email}</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3 mt-6">
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing(false);
                        setEditedProfile(profileData); // Reset to original data
                      }}
                      className="flex-1 bg-secondary-200 py-3 rounded-lg active:bg-secondary-300"
                      disabled={loading}
                    >
                      <Text className="text-center font-medium text-secondary-700">Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSaveProfile}
                      className="flex-1 bg-primary-500 py-3 rounded-lg active:bg-primary-600"
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-center font-medium text-surface">Sauvegarder</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => setIsEditing(true)}
                      className="flex-1 bg-primary-500 py-3 rounded-lg active:bg-primary-600"
                    >
                      <Text className="text-center font-medium text-surface">Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowPasswordModal(true)}
                      className="flex-1 bg-secondary-500 py-3 rounded-lg active:bg-secondary-600"
                    >
                      <Text className="text-center font-medium text-surface">Mot de passe</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Workout History Section */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-brand-text mb-4">Historique des séances</Text>
          
          {workoutHistory.length > 0 ? (
            <View className="space-y-3">
              {workoutHistory.map((session) => (
                <View key={session.id} className="bg-surface rounded-xl p-4 shadow-sm border border-border-light">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-brand-text mb-1">
                        {session.programTitle}
                      </Text>
                      <Text className="text-sm text-secondary-600">
                        {formatDate(session.date)}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${getPhaseColor(session.phase)}`}>
                      <Text className="text-xs font-medium">
                        {getPhaseEmoji(session.phase as any)} {session.phaseLabel}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color="#8B5A3C" />
                        <Text className="text-sm text-secondary-600 ml-1">
                          {formatDuration(session.duration)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="fitness-outline" size={16} color="#8B5A3C" />
                        <Text className="text-sm text-secondary-600 ml-1">
                          {session.exerciseCount} exercices
                        </Text>
                      </View>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${session.completed ? 'bg-success-100' : 'bg-warning-100'}`}>
                      <Text className={`text-xs font-medium ${session.completed ? 'text-success-700' : 'text-warning-700'}`}>
                        {session.completed ? 'Terminée' : 'Incomplète'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-surface rounded-xl p-6 items-center shadow-sm border border-border-light">
              <Text className="text-4xl mb-3">📊</Text>
              <Text className="text-lg font-bold text-brand-text mb-2">
                Aucune séance enregistrée
              </Text>
              <Text className="text-secondary-600 text-center">
                Commencez votre premier entraînement pour voir votre historique ici
              </Text>
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View className="px-6 mb-8">
          <Text className="text-xl font-bold text-brand-text mb-4">Paramètres</Text>
          <View className="bg-surface rounded-xl shadow-sm border border-border-light">
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-border-light active:bg-surface-secondary">
              <View className="flex-row items-center">
                <Ionicons name="notifications-outline" size={20} color="#8B5A3C" />
                <Text className="text-brand-text ml-3">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#A99985" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-border-light active:bg-surface-secondary">
              <View className="flex-row items-center">
                <Ionicons name="moon-outline" size={20} color="#8B5A3C" />
                <Text className="text-brand-text ml-3">Suivi du cycle</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#A99985" />
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between p-4 active:bg-surface-secondary">
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={20} color="#8B5A3C" />
                <Text className="text-brand-text ml-3">Aide & Support</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#A99985" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <SafeAreaView className="flex-1 bg-brand-background">
          <View className="px-6 py-4 border-b border-border bg-surface">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-brand-text">
                Changer le mot de passe
              </Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#8B5A3C" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-secondary-600 mb-2">
                  Mot de passe actuel
                </Text>
                <TextInput
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                  secureTextEntry
                  className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface focus:border-primary-500"
                  placeholder="Entrez votre mot de passe actuel"
                  placeholderTextColor="#A99985"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-secondary-600 mb-2">
                  Nouveau mot de passe
                </Text>
                <TextInput
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                  secureTextEntry
                  className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface focus:border-primary-500"
                  placeholder="Nouveau mot de passe (min 8 caractères)"
                  placeholderTextColor="#A99985"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-secondary-600 mb-2">
                  Confirmer le nouveau mot de passe
                </Text>
                <TextInput
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry
                  className="border border-border rounded-lg px-3 py-3 text-brand-text bg-surface focus:border-primary-500"
                  placeholder="Confirmez le nouveau mot de passe"
                  placeholderTextColor="#A99985"
                />
              </View>

              <TouchableOpacity
                onPress={handleChangePassword}
                className="bg-primary-500 py-4 rounded-xl mt-6 active:bg-primary-600 disabled:bg-primary-300"
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-center font-bold text-surface">
                    Changer le mot de passe
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileScreen;
