import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpFAQScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const faqItems: FAQItem[] = [
    {
      question: 'Jak utworzyć konto w aplikacji?',
      answer: 'Aby utworzyć konto, kliknij przycisk "Zarejestruj się" na ekranie logowania. Wypełnij wymagane pola, w tym imię, nazwisko, adres e-mail i hasło. Po rejestracji otrzymasz kod weryfikacyjny na podany adres e-mail, który należy wprowadzić, aby aktywować konto.'
    },
    {
      question: 'Jak zmienić swoje dane profilowe?',
      answer: 'Aby zmienić dane profilowe, przejdź do zakładki "Profil", a następnie kliknij przycisk "Edytuj profil". Możesz tam zaktualizować swoje dane osobowe, zdjęcie profilowe, informacje o klubie i pozycji na boisku.'
    },
    {
      question: 'Jak dodać mecz do systemu?',
      answer: 'Aby dodać mecz, przejdź do zakładki "Rozgrywki" i kliknij przycisk "+" w prawym górnym rogu. Wypełnij formularz z danymi meczu, w tym drużyny, datę, czas i miejsce. Pamiętaj, że musisz być zalogowany, aby dodać mecz.'
    },
    {
      question: 'Jak obserwować gracza na rynku transferowym?',
      answer: 'Aby obserwować gracza, przejdź do zakładki "Rynek", znajdź interesującego Cię zawodnika i kliknij ikonę serca przy jego profilu. Możesz później przeglądać obserwowanych graczy, klikając ikonę zakładki w prawym górnym rogu ekranu rynku.'
    },
    {
      question: 'Jak udostępnić post w społeczności?',
      answer: 'Aby udostępnić post, znajdź interesujący Cię wpis w zakładce "Społeczność" i kliknij przycisk "Udostępnij". Możesz wybrać, czy chcesz udostępnić post na swoim profilu, czy wysłać go w wiadomości prywatnej do innego użytkownika.'
    },
    {
      question: 'Jak zmienić język aplikacji?',
      answer: 'Aby zmienić język, przejdź do zakładki "Ustawienia", a następnie wybierz opcję "Język". Wybierz preferowany język z dostępnej listy. Zmiany będą widoczne po ponownym uruchomieniu aplikacji.'
    },
    {
      question: 'Jak dołączyć do gry w PlayArena?',
      answer: 'Aby dołączyć do gry w PlayArena, przejdź do zakładki "Rozgrywki", a następnie wybierz zakładkę "PlayArena". Znajdź dostępną grę i kliknij przycisk "Dołącz". Możesz również utworzyć własną grę, klikając przycisk "+" w prawym górnym rogu.'
    },
    {
      question: 'Jak zarządzać powiadomieniami?',
      answer: 'Aby zarządzać powiadomieniami, przejdź do zakładki "Ustawienia", a następnie wybierz opcję "Powiadomienia". Możesz tam włączyć lub wyłączyć poszczególne typy powiadomień, takie jak wiadomości, polubienia, komentarze czy aktywność na rynku.'
    },
    {
      question: 'Jak skontaktować się z obsługą?',
      answer: 'Aby skontaktować się z obsługą, przejdź do zakładki "Ustawienia", a następnie wybierz opcję "Kontakt email" lub "Kontakt telefoniczny". Możesz również skorzystać z Agenta AI, który pomoże Ci rozwiązać najczęstsze problemy.'
    },
    {
      question: 'Jak wylogować się z aplikacji?',
      answer: 'Aby wylogować się, przejdź do zakładki "Ustawienia" i przewiń na dół. Kliknij przycisk "Wyloguj się" i potwierdź swoją decyzję w wyświetlonym oknie dialogowym.'
    }
  ];

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>POMOC I FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          Znajdź odpowiedzi na najczęściej zadawane pytania dotyczące korzystania z aplikacji Game Profil.
        </Text>

        <View style={styles.faqContainer}>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity 
                style={styles.questionContainer}
                onPress={() => toggleExpand(index)}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                {expandedIndex === index ? (
                  <ChevronUp size={20} color="#FFFFFF" />
                ) : (
                  <ChevronDown size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Nie znalazłeś odpowiedzi?</Text>
          <Text style={styles.contactText}>
            Skontaktuj się z nami bezpośrednio:
          </Text>
          <Text style={styles.contactInfo}>Email: gameprofile@op.pl</Text>
          <Text style={styles.contactInfo}>Telefon: +48 512 636 595</Text>
          <Text style={styles.contactInfo}>Szymon Kunat</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 20,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  introText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 24,
  },
  faqContainer: {
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 16,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  answerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#AAAAAA',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#AAAAAA',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
});