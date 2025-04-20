import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
  PHONE = 'phone',
}

const AuthScreen = () => {
  const { colors, fontSize } = useTheme();
  const { signIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      if (mode === AuthMode.LOGIN) {
        if (!email || !password) {
          Alert.alert('Missing Fields', 'Please enter both email and password.');
          return;
        }
        
        await signIn(email, password);
      } else if (mode === AuthMode.REGISTER) {
        if (!email || !password || !confirmPassword) {
          Alert.alert('Missing Fields', 'Please fill in all required fields.');
          return;
        }
        
        if (password !== confirmPassword) {
          Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
          return;
        }
        
        // In a real app, this would register a new user
        Alert.alert('Registration', 'Registration would be implemented in a full app.');
      } else if (mode === AuthMode.PHONE) {
        if (!phoneNumber) {
          Alert.alert('Missing Phone Number', 'Please enter your phone number.');
          return;
        }
        
        // In a real app, this would send an OTP
        Alert.alert('Phone Authentication', 'Phone authentication would be implemented in a full app.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.appTitle, { color: colors.text, fontSize: fontSize.extraLarge }]}>
          AROGYA MITRA
        </Text>
        <Text style={[styles.appSubtitle, { color: colors.text, fontSize: fontSize.medium }]}>
          Elderly Care & Support
        </Text>
      </View>

      <View style={[styles.authContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              mode === AuthMode.LOGIN && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setMode(AuthMode.LOGIN)}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: mode === AuthMode.LOGIN ? colors.primary : colors.text, fontSize: fontSize.medium }
              ]}
            >
              Login
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              mode === AuthMode.REGISTER && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setMode(AuthMode.REGISTER)}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: mode === AuthMode.REGISTER ? colors.primary : colors.text, fontSize: fontSize.medium }
              ]}
            >
              Register
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              mode === AuthMode.PHONE && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setMode(AuthMode.PHONE)}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: mode === AuthMode.PHONE ? colors.primary : colors.text, fontSize: fontSize.medium }
              ]}
            >
              Phone
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {/* Email & Password Form */}
          {(mode === AuthMode.LOGIN || mode === AuthMode.REGISTER) && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                  Email
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="mail" size={20} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, fontSize: fontSize.medium }]}
                    placeholder="Enter your email"
                    placeholderTextColor="gray"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                  Password
                </Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="lock-closed" size={20} color={colors.text} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text, fontSize: fontSize.medium }]}
                    placeholder="Enter your password"
                    placeholderTextColor="gray"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={colors.text} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              {mode === AuthMode.REGISTER && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                    Confirm Password
                  </Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed" size={20} color={colors.text} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text, fontSize: fontSize.medium }]}
                      placeholder="Confirm your password"
                      placeholderTextColor="gray"
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
              )}
              
              {mode === AuthMode.LOGIN && (
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={[styles.forgotPassword, { color: colors.primary, fontSize: fontSize.small }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Phone Authentication Form */}
          {mode === AuthMode.PHONE && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, fontSize: fontSize.medium }]}>
                Phone Number
              </Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="call" size={20} color={colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontSize: fontSize.medium }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor="gray"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
              <Text style={[styles.helperText, { color: colors.text, fontSize: fontSize.small }]}>
                We'll send a verification code to this number
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={[styles.submitButtonText, { fontSize: fontSize.medium }]}>
                {mode === AuthMode.LOGIN ? 'Login' : 
                  mode === AuthMode.REGISTER ? 'Register' : 'Send Code'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.text, fontSize: fontSize.small }]}>
              OR
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={[styles.socialButtonText, { color: '#000000', fontSize: fontSize.medium }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo access button */}
      <TouchableOpacity
        style={[styles.demoButton, { borderColor: colors.primary }]}
        onPress={() => {
          // In a real app, this would log in with a demo account
          Alert.alert(
            'Demo Access',
            'In a real app, this would give quick access to a demo account. For now, please use the login options above.',
            [{ text: 'OK' }]
          );
        }}
      >
        <Text style={[styles.demoButtonText, { color: colors.primary, fontSize: fontSize.medium }]}>
          Quick Demo Access
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  appTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    opacity: 0.8,
  },
  authContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  eyeIcon: {
    padding: 10,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotPassword: {
    fontWeight: '500',
  },
  helperText: {
    marginTop: 6,
    opacity: 0.7,
  },
  submitButton: {
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    opacity: 0.7,
  },
  socialButton: {
    height: 55,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontWeight: '500',
  },
  demoButton: {
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 24,
  },
  demoButtonText: {
    fontWeight: '500',
  },
});

export default AuthScreen;
