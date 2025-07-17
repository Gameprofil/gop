import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>POLITYKA PRYWATNOŚCI</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Wprowadzenie</Text>
          <Text style={styles.paragraph}>
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych przekazanych przez Użytkowników w związku z korzystaniem z aplikacji Game Profil.
          </Text>
          <Text style={styles.paragraph}>
            Administratorem danych osobowych zbieranych za pośrednictwem aplikacji Game Profil jest Szymon Kunat, adres e-mail: gameprofile@op.pl, telefon: +48 512 636 595.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Zbieranie danych osobowych</Text>
          <Text style={styles.paragraph}>
            Podczas korzystania z aplikacji Game Profil możemy zbierać następujące dane:
          </Text>
          <Text style={styles.listItem}>• Dane podane podczas rejestracji: imię, nazwisko, adres e-mail, numer telefonu</Text>
          <Text style={styles.listItem}>• Dane profilowe: klub, pozycja, wzrost, wiek, kraj</Text>
          <Text style={styles.listItem}>• Dane o aktywności: posty, komentarze, polubienia, wiadomości</Text>
          <Text style={styles.listItem}>• Dane techniczne: adres IP, informacje o urządzeniu, identyfikatory urządzeń</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Cel przetwarzania danych</Text>
          <Text style={styles.paragraph}>
            Dane osobowe Użytkowników aplikacji Game Profil przetwarzane są w celu:
          </Text>
          <Text style={styles.listItem}>• Świadczenia usług drogą elektroniczną</Text>
          <Text style={styles.listItem}>• Umożliwienia korzystania z funkcji społecznościowych</Text>
          <Text style={styles.listItem}>• Prowadzenia statystyk i analiz</Text>
          <Text style={styles.listItem}>• Zapewnienia bezpieczeństwa</Text>
          <Text style={styles.listItem}>• Wysyłania powiadomień związanych z działaniem aplikacji</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Prawa użytkownika</Text>
          <Text style={styles.paragraph}>
            Użytkownik ma prawo do:
          </Text>
          <Text style={styles.listItem}>• Dostępu do swoich danych</Text>
          <Text style={styles.listItem}>• Sprostowania danych</Text>
          <Text style={styles.listItem}>• Usunięcia danych ("prawo do bycia zapomnianym")</Text>
          <Text style={styles.listItem}>• Ograniczenia przetwarzania</Text>
          <Text style={styles.listItem}>• Przenoszenia danych</Text>
          <Text style={styles.listItem}>• Sprzeciwu wobec przetwarzania danych</Text>
          <Text style={styles.listItem}>• Wycofania zgody na przetwarzanie danych</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Udostępnianie danych</Text>
          <Text style={styles.paragraph}>
            Dane osobowe Użytkowników mogą być udostępniane podmiotom uprawnionym do ich otrzymania na mocy obowiązujących przepisów prawa, a także podwykonawcom, czyli podmiotom, z których usług korzystamy przy przetwarzaniu danych, takim jak:
          </Text>
          <Text style={styles.listItem}>• Dostawcy usług hostingowych</Text>
          <Text style={styles.listItem}>• Dostawcy systemów analitycznych</Text>
          <Text style={styles.listItem}>• Dostawcy usług IT</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Bezpieczeństwo danych</Text>
          <Text style={styles.paragraph}>
            Administrator dokłada wszelkich starań, aby zapewnić bezpieczeństwo danych osobowych Użytkowników. Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić dane przed nieuprawnionym dostępem, utratą lub zniszczeniem.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Pliki cookies i podobne technologie</Text>
          <Text style={styles.paragraph}>
            Aplikacja Game Profil może wykorzystywać pliki cookies (ciasteczka) i podobne technologie w celu dostosowania serwisu do indywidualnych potrzeb użytkowników oraz w celach statystycznych.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Zmiany w polityce prywatności</Text>
          <Text style={styles.paragraph}>
            Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności. O wszelkich zmianach Użytkownicy będą informowani poprzez stosowne komunikaty w aplikacji.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Kontakt</Text>
          <Text style={styles.paragraph}>
            W sprawach związanych z ochroną danych osobowych można kontaktować się z Administratorem pod adresem e-mail: gameprofile@op.pl lub telefonicznie: +48 512 636 595.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data ostatniej aktualizacji: 01.06.2024
          </Text>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
    marginBottom: 12,
    lineHeight: 22,
  },
  listItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
    marginBottom: 8,
    paddingLeft: 16,
    lineHeight: 20,
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
});