import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert, 
  ActivityIndicator,
  Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  profile_type?: string;
  club?: string;
  position?: string;
  height?: string;
  avatar_url?: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Formularz danych użytkownika
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    club: '',
    position: '',
    height: '',
  });

  useEffect(() => {
    fetchProfile();
    requestPermissions();
  }, []);

  // Żądanie uprawnień do galerii
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Błąd', 'Potrzebujemy uprawnień do galerii, aby zmienić zdjęcie profilowe');
      }
    }
  };

  // Pobieranie aktualnych danych profilu
  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Błąd', 'Brak tokena autoryzacji');
        router.back();
        return;
      }

      const response = await fetch('https://game-p.onrender.com/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserData(data);
        // Wypełnienie formularza aktualnymi danymi
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          club: data.club || '',
          position: data.position || '',
          height: data.height || '',
        });
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać profilu');
        router.back();
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas pobierania profilu');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do wyboru zdjęcia z galerii
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Kwadratowe zdjęcie
        quality: 0.8,
        base64: true, // Potrzebne do przesyłania na backend
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Błąd', 'Nie udało się wybrać zdjęcia');
    }
  };

  // Funkcja do aktualizacji pola formularza
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Funkcja do zapisania zmian
  const handleSave = async () => {
    try {
      setSaving(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Błąd', 'Brak tokena autoryzacji');
        return;
      }

      // Przygotowanie danych do wysłania
      const updateData: any = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone,
        club: formData.club,
        position: formData.position,
        height: formData.height,
      };

      // Jeśli wybrano nowe zdjęcie, dodaj je do danych
      if (selectedImage) {
        // Konwersja obrazu do base64 (jeśli backend tego wymaga)
        // Lub można użyć FormData dla multipart/form-data
        updateData.avatar_base64 = selectedImage;
      }

      const response = await fetch('https://game-p.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Sukces', 'Profil został zaktualizowany', [
          {
            text: 'OK',
            onPress: () => {
              // Powrót do ekranu profilu i odświeżenie danych
              router.back();
            }
          }
        ]);
      } else {
        Alert.alert('Błąd', data.error || 'Nie udało się zaktualizować profilu');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas aktualizacji profilu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie danych...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!userData) {
    return (
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Brak danych profilu</Text>
        </View>
      </LinearGradient>
    );
  }

  // URL aktualnego avatara lub wybranego zdjęcia
  const currentAvatarUrl = selectedImage || userData.avatar_url || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1';

  return (
    <LinearGradient
      colors={['#000000', '#1a1a1a']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EDYTUJ PROFIL</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Sekcja zdjęcia profilowego */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: currentAvatarUrl }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
              <Camera size={20} color="#000000" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.changePhotoTextButton} onPress={pickImage}>
            <Text style={styles.changePhotoText}>Zmień zdjęcie</Text>
          </TouchableOpacity>
        </View>

        {/* Formularz edycji */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>DANE PODSTAWOWE</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Imię</Text>
            <TextInput
              style={styles.input}
              value={formData.first_name}
              onChangeText={(value) => handleInputChange('first_name', value)}
              placeholder="Wpisz swoje imię"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nazwisko</Text>
            <TextInput
              style={styles.input}
              value={formData.last_name}
              onChangeText={(value) => handleInputChange('last_name', value)}
              placeholder="Wpisz swoje nazwisko"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+48 123 456 789"
              placeholderTextColor="#666666"
              keyboardType="phone-pad"
            />
          </View>

          <Text style={styles.sectionTitle}>DANE SPORTOWE</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Klub</Text>
            <TextInput
              style={styles.input}
              value={formData.club}
              onChangeText={(value) => handleInputChange('club', value)}
              placeholder="Nazwa klubu"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pozycja</Text>
            <TextInput
              style={styles.input}
              value={formData.position}
              onChangeText={(value) => handleInputChange('position', value)}
              placeholder="np. Środkowy Pomocnik"
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Wzrost</Text>
            <TextInput
              style={styles.input}
              value={formData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              placeholder="np. 180 cm"
              placeholderTextColor="#666666"
            />
          </View>

          {/* Przycisk zapisz */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.saveButtonGradient}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Save size={20} color="#000000" />
                  <Text style={styles.saveButtonText}>Zapisz zmiany</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FF4444',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  placeholder: {
    width: 44,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  changePhotoTextButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  formSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 16,
    letterSpacing: 1,
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#000000',
    marginLeft: 8,
    letterSpacing: 1,
  },
});