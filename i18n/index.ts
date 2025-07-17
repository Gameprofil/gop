import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import pl from './locales/pl.json';
import en from './locales/en.json';
import es from './locales/es.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import pt from './locales/pt.json';

// Create i18n instance
const i18n = new I18n({
  pl,
  en,
  es,
  de,
  fr,
  it,
  zh,
  ja,
  pt,
});

// Set default locale
i18n.defaultLocale = 'pl';
i18n.locale = 'pl';

// Enable fallbacks
i18n.enableFallback = true;

// Language storage key
const LANGUAGE_KEY = 'app_language';

// Available languages
export const AVAILABLE_LANGUAGES = [
  { code: 'pl', name: 'Polski', nativeName: 'Polski' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Español', nativeName: 'Español' },
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch' },
  { code: 'fr', name: 'Français', nativeName: 'Français' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'pt', name: 'Português', nativeName: 'Português' },
];

// Load saved language
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    }
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
};

// Save language preference
export const saveLanguage = async (languageCode: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    i18n.locale = languageCode;
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Get current language
export const getCurrentLanguage = () => i18n.locale;

// Translation function
export const t = (key: string, options?: any) => i18n.t(key, options);

export default i18n;