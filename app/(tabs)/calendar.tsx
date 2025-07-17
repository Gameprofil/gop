import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Wallpaper as SoccerBall, Trophy, Clock, MapPin, Users, X, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  type: 'training' | 'match' | 'recovery' | 'analysis';
  location: string;
  details?: string;
}

interface Day {
  date: string;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function CalendarScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'micro' | 'mezo'>('micro');
  const [showEventModal, setShowEventModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    training: true,
    match: true,
    recovery: true,
    analysis: true
  });

  // Generate calendar days
  const generateCalendarDays = (date: Date, view: 'micro' | 'mezo'): Day[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay() || 7; // Convert Sunday (0) to 7
    
    const days: Day[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDayOfWeek - 1; i > 0; i--) {
      const day = daysInPrevMonth - i + 1;
      days.push({
        date: `${year}-${month === 0 ? 12 : month}-${day}`,
        day,
        month: month === 0 ? 12 : month,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
      
      days.push({
        date: `${year}-${month + 1}-${day}`,
        day,
        month: month + 1,
        year,
        isCurrentMonth: true,
        isToday,
        events: getEventsForDate(date)
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = view === 'micro' ? 42 - days.length : 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: `${year}-${month + 2}-${day}`,
        day,
        month: month + 2 > 12 ? 1 : month + 2,
        year: month + 2 > 12 ? year + 1 : year,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }
    
    return days;
  };

  // Mock events data
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateString = date.toISOString().split('T')[0];
    
    // Mock events
    const allEvents: CalendarEvent[] = [
      {
        id: '1',
        date: '2024-06-15',
        time: '17:00',
        title: 'Trening taktyczny',
        type: 'training',
        location: 'Boisko główne'
      },
      {
        id: '2',
        date: '2024-06-17',
        time: '16:30',
        title: 'Trening siłowy',
        type: 'training',
        location: 'Siłownia klubowa'
      },
      {
        id: '3',
        date: '2024-06-18',
        time: '18:00',
        title: 'Legia Warszawa vs Lech Poznań',
        type: 'match',
        location: 'Stadion Wojska Polskiego'
      },
      {
        id: '4',
        date: '2024-06-19',
        time: '11:00',
        title: 'Regeneracja',
        type: 'recovery',
        location: 'Centrum odnowy'
      },
      {
        id: '5',
        date: '2024-06-20',
        time: '15:00',
        title: 'Analiza meczu',
        type: 'analysis',
        location: 'Sala konferencyjna'
      }
    ];
    
    return allEvents.filter(event => event.date === dateString);
  };

  // Get events for selected date
  const getEventsForSelectedDate = (): CalendarEvent[] => {
    const dateString = selectedDate.toISOString().split('T')[0];
    
    // Mock events
    const allEvents: CalendarEvent[] = [
      {
        id: '1',
        date: '2024-06-15',
        time: '17:00',
        title: 'Trening taktyczny',
        type: 'training',
        location: 'Boisko główne'
      },
      {
        id: '2',
        date: '2024-06-17',
        time: '16:30',
        title: 'Trening siłowy',
        type: 'training',
        location: 'Siłownia klubowa'
      },
      {
        id: '3',
        date: '2024-06-18',
        time: '18:00',
        title: 'Legia Warszawa vs Lech Poznań',
        type: 'match',
        location: 'Stadion Wojska Polskiego'
      },
      {
        id: '4',
        date: '2024-06-19',
        time: '11:00',
        title: 'Regeneracja',
        type: 'recovery',
        location: 'Centrum odnowy'
      },
      {
        id: '5',
        date: '2024-06-20',
        time: '15:00',
        title: 'Analiza meczu',
        type: 'analysis',
        location: 'Sala konferencyjna'
      }
    ];
    
    return allEvents
      .filter(event => event.date === dateString)
      .filter(event => filters[event.type]);
  };

  // Get month name
  const getMonthName = (month: number): string => {
    const months = [
      'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return months[month];
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle day selection
  const handleDaySelect = (day: Day) => {
    setSelectedDate(new Date(day.year, day.month - 1, day.day));
  };

  // Get event color
  const getEventColor = (type: string): string => {
    switch (type) {
      case 'training': return '#00FF88';
      case 'match': return '#FF4444';
      case 'recovery': return '#3B82F6';
      case 'analysis': return '#FFD700';
      default: return '#FFFFFF';
    }
  };

  // Get event icon
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'training': return <SoccerBall size={16} color="#FFFFFF" />;
      case 'match': return <Trophy size={16} color="#FFFFFF" />;
      case 'recovery': return <Users size={16} color="#FFFFFF" />;
      case 'analysis': return <CalendarIcon size={16} color="#FFFFFF" />;
      default: return <CalendarIcon size={16} color="#FFFFFF" />;
    }
  };

  // Calendar days
  const calendarDays = generateCalendarDays(currentDate, calendarView);
  
  // Selected date events
  const selectedDateEvents = getEventsForSelectedDate();

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KALENDARZ</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowEventModal(true)}
            >
              <Plus size={20} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Type Selector */}
        <View style={styles.calendarTypeContainer}>
          <TouchableOpacity
            style={[
              styles.calendarTypeButton,
              calendarView === 'micro' && styles.activeCalendarType
            ]}
            onPress={() => setCalendarView('micro')}
          >
            <Text style={[
              styles.calendarTypeText,
              calendarView === 'micro' && styles.activeCalendarTypeText
            ]}>
              Mikrocykl
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.calendarTypeButton,
              calendarView === 'mezo' && styles.activeCalendarType
            ]}
            onPress={() => setCalendarView('mezo')}
          >
            <Text style={[
              styles.calendarTypeText,
              calendarView === 'mezo' && styles.activeCalendarTypeText
            ]}>
              Mezocykl
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Navigation */}
        <View style={styles.calendarNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <ChevronLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.currentMonth}>
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <ChevronRight size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {/* Weekday Headers */}
          <View style={styles.weekdayHeader}>
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'].map((day, index) => (
              <Text key={index} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar Days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.otherMonthDay,
                  day.isToday && styles.todayCell,
                  selectedDate.getDate() === day.day && 
                  selectedDate.getMonth() + 1 === day.month && 
                  selectedDate.getFullYear() === day.year && styles.selectedDay
                ]}
                onPress={() => handleDaySelect(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.otherMonthDayText,
                  day.isToday && styles.todayText,
                  selectedDate.getDate() === day.day && 
                  selectedDate.getMonth() + 1 === day.month && 
                  selectedDate.getFullYear() === day.year && styles.selectedDayText
                ]}>
                  {day.day}
                </Text>
                
                {/* Event Indicators */}
                <View style={styles.eventIndicators}>
                  {day.events.slice(0, 3).map((event, eventIndex) => (
                    <View 
                      key={eventIndex} 
                      style={[
                        styles.eventIndicator,
                        { backgroundColor: getEventColor(event.type) }
                      ]}
                    />
                  ))}
                  {day.events.length > 3 && (
                    <Text style={styles.moreEventsText}>+{day.events.length - 3}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>
            {selectedDate.getDate()} {getMonthName(selectedDate.getMonth())} {selectedDate.getFullYear()}
          </Text>
          
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <TouchableOpacity 
                key={event.id} 
                style={styles.eventCard}
                onPress={() => {
                  if (event.type === 'training') {
                    router.push(`/training-detail?id=${event.id}`);
                  } else if (event.type === 'match') {
                    router.push(`/match-detail?id=${event.id}`);
                  }
                }}
              >
                <View 
                  style={[
                    styles.eventTypeIndicator,
                    { backgroundColor: getEventColor(event.type) }
                  ]}
                >
                  {getEventIcon(event.type)}
                </View>
                
                <View style={styles.eventDetails}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  <View style={styles.eventInfo}>
                    <View style={styles.eventInfoItem}>
                      <Clock size={14} color="#888888" />
                      <Text style={styles.eventInfoText}>{event.time}</Text>
                    </View>
                    <View style={styles.eventInfoItem}>
                      <MapPin size={14} color="#888888" />
                      <Text style={styles.eventInfoText}>{event.location}</Text>
                    </View>
                  </View>
                </View>
                
                <ChevronRight size={20} color="#888888" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <CalendarIcon size={48} color="#666666" />
              <Text style={styles.noEventsText}>Brak wydarzeń na ten dzień</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal
        visible={showEventModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj wydarzenie</Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.eventTypeSelector}>
              <TouchableOpacity style={[styles.eventTypeButton, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
                <SoccerBall size={24} color="#00FF88" />
                <Text style={styles.eventTypeText}>Trening</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.eventTypeButton, { backgroundColor: 'rgba(255, 68, 68, 0.2)' }]}>
                <Trophy size={24} color="#FF4444" />
                <Text style={styles.eventTypeText}>Mecz</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.eventTypeButton, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Users size={24} color="#3B82F6" />
                <Text style={styles.eventTypeText}>Regeneracja</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.eventTypeButton, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                <CalendarIcon size={24} color="#FFD700" />
                <Text style={styles.eventTypeText}>Analiza</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalMessage}>
              Wybierz typ wydarzenia, aby przejść do szczegółowego formularza
            </Text>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtry</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterItem}>
              <View style={styles.filterItemLeft}>
                <View style={[styles.filterIcon, { backgroundColor: 'rgba(0, 255, 136, 0.2)' }]}>
                  <SoccerBall size={20} color="#00FF88" />
                </View>
                <Text style={styles.filterText}>Treningi</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  filters.training && styles.toggleButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, training: !prev.training }))}
              >
                <View 
                  style={[
                    styles.toggleCircle,
                    filters.training && styles.toggleCircleActive
                  ]}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterItem}>
              <View style={styles.filterItemLeft}>
                <View style={[styles.filterIcon, { backgroundColor: 'rgba(255, 68, 68, 0.2)' }]}>
                  <Trophy size={20} color="#FF4444" />
                </View>
                <Text style={styles.filterText}>Mecze</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  filters.match && styles.toggleButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, match: !prev.match }))}
              >
                <View 
                  style={[
                    styles.toggleCircle,
                    filters.match && styles.toggleCircleActive
                  ]}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterItem}>
              <View style={styles.filterItemLeft}>
                <View style={[styles.filterIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Users size={20} color="#3B82F6" />
                </View>
                <Text style={styles.filterText}>Regeneracja</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  filters.recovery && styles.toggleButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, recovery: !prev.recovery }))}
              >
                <View 
                  style={[
                    styles.toggleCircle,
                    filters.recovery && styles.toggleCircleActive
                  ]}
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterItem}>
              <View style={styles.filterItemLeft}>
                <View style={[styles.filterIcon, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]}>
                  <CalendarIcon size={20} color="#FFD700" />
                </View>
                <Text style={styles.filterText}>Analizy</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  filters.analysis && styles.toggleButtonActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, analysis: !prev.analysis }))}
              >
                <View 
                  style={[
                    styles.toggleCircle,
                    filters.analysis && styles.toggleCircleActive
                  ]}
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Zastosuj filtry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTypeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  calendarTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeCalendarType: {
    backgroundColor: '#FFFFFF',
  },
  calendarTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  activeCalendarTypeText: {
    color: '#000000',
  },
  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentMonth: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
  },
  calendarGrid: {
    marginBottom: 24,
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 32) / 7,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  todayCell: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  selectedDay: {
    backgroundColor: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  otherMonthDayText: {
    color: '#666666',
  },
  todayText: {
    color: '#00FF88',
  },
  selectedDayText: {
    color: '#000000',
  },
  eventIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  moreEventsText: {
    fontSize: 8,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 2,
  },
  eventsContainer: {
    marginBottom: 32,
  },
  eventsTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventTypeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  eventInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    marginLeft: 6,
  },
  noEventsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noEventsText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: width * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
  },
  eventTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  eventTypeButton: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventTypeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'center',
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  filterText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#00FF88',
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
  applyButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});