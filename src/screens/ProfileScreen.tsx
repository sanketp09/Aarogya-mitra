import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { colors, fontSize, theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const switchToHighContrast = () => {
    setTheme('high-contrast');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text, fontSize: fontSize.large }]}>
          {user?.displayName || 'User'}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.text, fontSize: fontSize.medium }]}>
          {user?.email || 'No email'}
        </Text>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Appearance
        </Text>

        <TouchableOpacity 
          style={[styles.settingOption, { borderColor: colors.border }]}
          onPress={toggleTheme}
        >
          <Ionicons 
            name={theme === 'dark' ? 'sunny' : 'moon'} 
            size={24} 
            color={colors.primary} 
            style={styles.settingIcon}
          />
          <Text style={[styles.settingText, { color: colors.text, fontSize: fontSize.medium }]}>
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingOption, { borderColor: colors.border }]}
          onPress={switchToHighContrast}
        >
          <Ionicons 
            name="contrast" 
            size={24} 
            color={colors.primary} 
            style={styles.settingIcon}
          />
          <Text style={[styles.settingText, { color: colors.text, fontSize: fontSize.medium }]}>
            High Contrast Mode
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Account
        </Text>

        <TouchableOpacity style={[styles.settingOption, { borderColor: colors.border }]}>
          <Ionicons 
            name="person" 
            size={24} 
            color={colors.primary} 
            style={styles.settingIcon}
          />
          <Text style={[styles.settingText, { color: colors.text, fontSize: fontSize.medium }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingOption, { borderColor: colors.border }]}>
          <Ionicons 
            name="notifications" 
            size={24} 
            color={colors.primary} 
            style={styles.settingIcon}
          />
          <Text style={[styles.settingText, { color: colors.text, fontSize: fontSize.medium }]}>
            Notification Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingOption, { borderColor: colors.border }]}>
          <Ionicons 
            name="shield-checkmark" 
            size={24} 
            color={colors.primary} 
            style={styles.settingIcon}
          />
          <Text style={[styles.settingText, { color: colors.text, fontSize: fontSize.medium }]}>
            Privacy Settings
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.signOutButton, { backgroundColor: colors.error }]}
        onPress={handleSignOut}
      >
        <Ionicons name="log-out" size={20} color="#FFFFFF" style={styles.signOutIcon} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.appInfo}>
        <Text style={[styles.appVersion, { color: colors.text, fontSize: fontSize.small }]}>
          AROGYA MITRA v1.0.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    opacity: 0.7,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 25,
    marginTop: 20,
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 40,
  },
  appVersion: {
    opacity: 0.5,
  },
});

export default ProfileScreen;
