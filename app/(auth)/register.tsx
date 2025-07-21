import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Imię jest wymagane';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nazwisko jest wymagane';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdź hasło';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Sprawdzenie unikalności
      const checkResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/check-unique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        if (checkData.error === 'EMAIL_EXISTS') {
          setErrors({ email: 'Ten email jest już zajęty' });
        } else if (checkData.error === 'NAME_EXISTS') {
          setErrors({
            firstName: 'Użytkownik o tym imieniu i nazwisku już istnieje',
            lastName: 'Użytkownik o tym imieniu i nazwisku już istnieje'
          });
        } else {
          Alert.alert('Błąd', checkData.error || 'Wystąpił błąd podczas sprawdzania danych');
        }
        setLoading(false);
        return;
      }

      // 2. Rejestracja użytkownika
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Sprawdź email',
          'Kod weryfikacyjny został wysłany na Twój adres email.',
          [
            {
              text: 'OK',
              onPress: () => router.push({
                pathname: '/(auth)/verify-email',
                params: { email: formData.email }
              })
            }
          ]
        );
      } else {
        Alert.alert('Błąd rejestracji', data.error || 'Wystąpił błąd podczas rejestracji');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Błąd', 'Problem z połączeniem z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>REJESTRACJA</Text>
            <Text style={styles.subtitle}>
              Utwórz nowe konto
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Imię</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, errors.firstName && styles.inputError]}
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  placeholder="Wpisz swoje imię"
                  placeholderTextColor="#666666"
                />
              </View>
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nazwisko</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, errors.lastName && styles.inputError]}
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  placeholder="Wpisz swoje nazwisko"
                  placeholderTextColor="#666666"
                />
              </View>
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="twoj@email.com"
                  placeholderTextColor="#666666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hasło</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, errors.password && styles.inputError]}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Wpisz hasło"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#666666" />
                  ) : (
                    <Eye size={20} color="#666666" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Potwierdź hasło</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIcon, errors.confirmPassword && styles.inputError]}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Potwierdź hasło"
                  placeholderTextColor="#666666"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#666666" />
                  ) : (
                    <Eye size={20} color="#666666" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F0F0F0']}
                style={styles.buttonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Rejestrowanie...' : 'Zarejestruj się'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.back()}
            >
              <Text style={styles.loginButtonText}>
                Masz już konto? Zaloguj się
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Rejestrując się, akceptujesz nasze Warunki korzystania i Politykę prywatności
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWithIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 48,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  inputError: {
    borderColor: '#FF4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FF4444',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#000000',
    letterSpacing: 1,
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
});