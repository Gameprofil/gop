import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Modal,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Wallpaper as SoccerBall, Calendar, Clock, MapPin, Users, CreditCard as Edit, Save, Plus, Trash2, X, Check, Clock3, FileText, Video, Download } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

interface Training {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  playersConfirmed: number;
  totalPlayers: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  conspect?: {
    topic: string;
    goals: string[];
    rules: string[];
    equipment: string[];
    sections: {
      name: string;
      duration: string;
      description: string;
      exercises: {
        name: string;
        description: string;
        image?: string;
      }[];
    }[];
  };
  notes?: string;
  videos?: {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
  }[];
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  position: string;
  status: 'present' | 'absent' | 'late' | 'unknown';
  stats?: {
    intensity: number;
    technique: number;
    tactical: number;
    physical: number;
  };
}

export default function TrainingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [training, setTraining] = useState<Training | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTab, setActiveTab] = useState('conspect');
  const [isEditing, setIsEditing] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingDetails();
  }, [id]);

  const fetchTrainingDetails = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      setTimeout(() => {
        const mockTraining: Training = {
          id: id as string,
          date: '15.06.2024',
          time: '17:00',
          title: 'Trening taktyczny',
          location: 'Boisko główne',
          duration: '90 min',
          playersConfirmed: 18,
          totalPlayers: 22,
          status: 'upcoming',
          conspect: {
            topic: 'Rozegranie piłki od bramkarza',
            goals: [
              'Poprawa rozegrania piłki od bramkarza',
              'Zwiększenie efektywności pierwszej fazy budowania akcji',
              'Praca nad ustawieniem zawodników w fazie otwarcia gry'
            ],
            rules: [
              'Gra na maksymalnie 2 kontakty',
              'Bramkarz rozpoczyna grę',
              'Pressing po stracie piłki'
            ],
            equipment: [
              'Piłki (10 szt.)',
              'Pachołki (20 szt.)',
              'Oznaczniki (2 kolory)',
              'Bramki przenośne (2 szt.)'
            ],
            sections: [
              {
                name: 'Rozgrzewka',
                duration: '15 min',
                description: 'Rozgrzewka ogólnorozwojowa z elementami koordynacji ruchowej',
                exercises: [
                  {
                    name: 'Bieg z niskim unoszeniem kolan',
                    description: 'Zawodnicy biegają dookoła boiska z niskim unoszeniem kolan',
                  },
                  {
                    name: 'Skipy A, B, C',
                    description: 'Zawodnicy wykonują skipy na dystansie 20 metrów',
                  },
                  {
                    name: 'Rozciąganie dynamiczne',
                    description: 'Zawodnicy wykonują rozciąganie dynamiczne wszystkich partii mięśniowych',
                  }
                ]
              },
              {
                name: 'Część główna',
                duration: '60 min',
                description: 'Ćwiczenia taktyczne związane z rozegraniem piłki od bramkarza',
                exercises: [
                  {
                    name: 'Ćwiczenie 1: Rozegranie w sektorach',
                    description: 'Boisko podzielone na 3 sektory. Bramkarz + 4 obrońców vs 3 napastników. Zadaniem jest wyprowadzenie piłki do środkowego sektora.',
                    image: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
                  },
                  {
                    name: 'Ćwiczenie 2: Gra 8v8 z akcentem na otwarcie',
                    description: 'Gra 8v8 na połowie boiska. Drużyna broniąca po odbiorze musi zagrać do swojego bramkarza i rozpocząć atak od nowa.',
                    image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
                  }
                ]
              },
              {
                name: 'Część końcowa',
                duration: '15 min',
                description: 'Gra wewnętrzna i ćwiczenia rozciągające',
                exercises: [
                  {
                    name: 'Gra wewnętrzna',
                    description: 'Gra 11v11 na całym boisku z akcentem na rozegranie od bramkarza',
                  },
                  {
                    name: 'Rozciąganie statyczne',
                    description: 'Zawodnicy wykonują rozciąganie statyczne wszystkich partii mięśniowych',
                  }
                ]
              }
            ]
          },
          notes: 'Zwrócić szczególną uwagę na ustawienie środkowych obrońców podczas rozegrania. Bramkarz powinien szukać wolnych przestrzeni do podania.',
          videos: [
            {
              id: 'v1',
              title: 'Rozegranie od bramkarza - przykłady',
              url: 'https://example.com/video1.mp4',
              thumbnail: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
            }
          ]
        };
        
        const mockPlayers: Player[] = [
          { 
            id: '1', 
            name: 'Robert Lewandowski', 
            avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 
            position: 'Napastnik', 
            status: 'present',
            stats: {
              intensity: 85,
              technique: 90,
              tactical: 80,
              physical: 85
            }
          },
          { 
            id: '2', 
            name: 'Piotr Zieliński', 
            avatar: 'https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 
            position: 'Pomocnik', 
            status: 'present',
            stats: {
              intensity: 80,
              technique: 85,
              tactical: 90,
              physical: 75
            }
          },
          { 
            id: '3', 
            name: 'Wojciech Szczęsny', 
            avatar: 'https://images.pexels.com/photos/1222273/pexels-photo-1222273.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 
            position: 'Bramkarz', 
            status: 'late',
            stats: {
              intensity: 70,
              technique: 75,
              tactical: 85,
              physical: 80
            }
          },
          { 
            id: '4', 
            name: 'Jan Bednarek', 
            avatar: 'https://images.pexels.com/photos/1222274/pexels-photo-1222274.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 
            position: 'Obrońca', 
            status: 'absent',
            stats: {
              intensity: 0,
              technique: 0,
              tactical: 0,
              physical: 0
            }
          },
          { 
            id: '5', 
            name: 'Kamil Glik', 
            avatar: 'https://images.pexels.com/photos/1222275/pexels-photo-1222275.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1', 
            position: 'Obrońca', 
            status: 'unknown' 
          }
        ];
        
        setTraining(mockTraining);
        setPlayers(mockPlayers);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching training details:', error);
      setLoading(false);
    }
  };

  const updatePlayerStatus = (playerId: string, status: 'present' | 'absent' | 'late') => {
    // In a real app, this would update the player's status in the database
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, status } 
          : player
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#00FF88';
      case 'absent': return '#FF4444';
      case 'late': return '#FFD700';
      default: return '#888888';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check size={16} color="#00FF88" />;
      case 'absent': return <X size={16} color="#FF4444" />;
      case 'late': return <Clock3 size={16} color="#FFD700" />;
      default: return <Check size={16} color="#888888" />;
    }
  };

  const handleSaveTraining = () => {
    // In a real app, this would save the training to the database
    setIsEditing(false);
    Alert.alert('Sukces', 'Trening został zaktualizowany');
  };

  const renderConspectTab = () => {
    if (!training?.conspect) {
      return (
        <View style={styles.emptyState}>
          <FileText size={48} color="#666666" />
          <Text style={styles.emptyText}>Brak konspektu</Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Dodaj konspekt</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.conspectContainer}>
        {/* Topic */}
        <View style={styles.conspectSection}>
          <Text style={styles.conspectSectionTitle}>Temat zajęć</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={training.conspect.topic}
              onChangeText={(text) => {
                setTraining(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    conspect: {
                      ...prev.conspect!,
                      topic: text
                    }
                  };
                });
              }}
              placeholder="Temat zajęć"
              placeholderTextColor="#666666"
            />
          ) : (
            <Text style={styles.conspectText}>{training.conspect.topic}</Text>
          )}
        </View>

        {/* Goals */}
        <View style={styles.conspectSection}>
          <Text style={styles.conspectSectionTitle}>Cele gry</Text>
          {training.conspect.goals.map((goal, index) => (
            <View key={index} style={styles.listItem}>
              {isEditing ? (
                <View style={styles.editListItem}>
                  <TextInput
                    style={styles.editListInput}
                    value={goal}
                    onChangeText={(text) => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newGoals = [...prev.conspect!.goals];
                        newGoals[index] = text;
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            goals: newGoals
                          }
                        };
                      });
                    }}
                    placeholder="Cel gry"
                    placeholderTextColor="#666666"
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newGoals = [...prev.conspect!.goals];
                        newGoals.splice(index, 1);
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            goals: newGoals
                          }
                        };
                      });
                    }}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.listItemText}>{goal}</Text>
                </>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setTraining(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    conspect: {
                      ...prev.conspect!,
                      goals: [...prev.conspect!.goals, '']
                    }
                  };
                });
              }}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Dodaj cel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rules */}
        <View style={styles.conspectSection}>
          <Text style={styles.conspectSectionTitle}>Zasady gry</Text>
          {training.conspect.rules.map((rule, index) => (
            <View key={index} style={styles.listItem}>
              {isEditing ? (
                <View style={styles.editListItem}>
                  <TextInput
                    style={styles.editListInput}
                    value={rule}
                    onChangeText={(text) => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newRules = [...prev.conspect!.rules];
                        newRules[index] = text;
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            rules: newRules
                          }
                        };
                      });
                    }}
                    placeholder="Zasada gry"
                    placeholderTextColor="#666666"
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newRules = [...prev.conspect!.rules];
                        newRules.splice(index, 1);
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            rules: newRules
                          }
                        };
                      });
                    }}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.listItemText}>{rule}</Text>
                </>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setTraining(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    conspect: {
                      ...prev.conspect!,
                      rules: [...prev.conspect!.rules, '']
                    }
                  };
                });
              }}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Dodaj zasadę</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Equipment */}
        <View style={styles.conspectSection}>
          <Text style={styles.conspectSectionTitle}>Przybory / Oznaczniki</Text>
          {training.conspect.equipment.map((item, index) => (
            <View key={index} style={styles.listItem}>
              {isEditing ? (
                <View style={styles.editListItem}>
                  <TextInput
                    style={styles.editListInput}
                    value={item}
                    onChangeText={(text) => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newEquipment = [...prev.conspect!.equipment];
                        newEquipment[index] = text;
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            equipment: newEquipment
                          }
                        };
                      });
                    }}
                    placeholder="Sprzęt"
                    placeholderTextColor="#666666"
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newEquipment = [...prev.conspect!.equipment];
                        newEquipment.splice(index, 1);
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            equipment: newEquipment
                          }
                        };
                      });
                    }}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.listItemText}>{item}</Text>
                </>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setTraining(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    conspect: {
                      ...prev.conspect!,
                      equipment: [...prev.conspect!.equipment, '']
                    }
                  };
                });
              }}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Dodaj sprzęt</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Training Sections */}
        {training.conspect.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.trainingSection}>
            <View style={styles.sectionHeader}>
              {isEditing ? (
                <View style={styles.editSectionHeader}>
                  <TextInput
                    style={styles.editSectionTitle}
                    value={section.name}
                    onChangeText={(text) => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newSections = [...prev.conspect!.sections];
                        newSections[sectionIndex] = {
                          ...newSections[sectionIndex],
                          name: text
                        };
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            sections: newSections
                          }
                        };
                      });
                    }}
                    placeholder="Nazwa sekcji"
                    placeholderTextColor="#666666"
                  />
                  <TextInput
                    style={styles.editSectionDuration}
                    value={section.duration}
                    onChangeText={(text) => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newSections = [...prev.conspect!.sections];
                        newSections[sectionIndex] = {
                          ...newSections[sectionIndex],
                          duration: text
                        };
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            sections: newSections
                          }
                        };
                      });
                    }}
                    placeholder="Czas trwania"
                    placeholderTextColor="#666666"
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newSections = [...prev.conspect!.sections];
                        newSections.splice(sectionIndex, 1);
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            sections: newSections
                          }
                        };
                      });
                    }}
                  >
                    <Trash2 size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.sectionTitle}>{section.name}</Text>
                  <Text style={styles.sectionDuration}>{section.duration}</Text>
                </>
              )}
            </View>
            
            {isEditing ? (
              <TextInput
                style={styles.editSectionDescription}
                value={section.description}
                onChangeText={(text) => {
                  setTraining(prev => {
                    if (!prev) return prev;
                    const newSections = [...prev.conspect!.sections];
                    newSections[sectionIndex] = {
                      ...newSections[sectionIndex],
                      description: text
                    };
                    return {
                      ...prev,
                      conspect: {
                        ...prev.conspect!,
                        sections: newSections
                      }
                    };
                  });
                }}
                placeholder="Opis sekcji"
                placeholderTextColor="#666666"
                multiline
              />
            ) : (
              <Text style={styles.sectionDescription}>{section.description}</Text>
            )}
            
            {/* Exercises */}
            {section.exercises.map((exercise, exerciseIndex) => (
              <View key={exerciseIndex} style={styles.exercise}>
                {isEditing ? (
                  <View style={styles.editExercise}>
                    <TextInput
                      style={styles.editExerciseName}
                      value={exercise.name}
                      onChangeText={(text) => {
                        setTraining(prev => {
                          if (!prev) return prev;
                          const newSections = [...prev.conspect!.sections];
                          const newExercises = [...newSections[sectionIndex].exercises];
                          newExercises[exerciseIndex] = {
                            ...newExercises[exerciseIndex],
                            name: text
                          };
                          newSections[sectionIndex] = {
                            ...newSections[sectionIndex],
                            exercises: newExercises
                          };
                          return {
                            ...prev,
                            conspect: {
                              ...prev.conspect!,
                              sections: newSections
                            }
                          };
                        });
                      }}
                      placeholder="Nazwa ćwiczenia"
                      placeholderTextColor="#666666"
                    />
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => {
                        setTraining(prev => {
                          if (!prev) return prev;
                          const newSections = [...prev.conspect!.sections];
                          const newExercises = [...newSections[sectionIndex].exercises];
                          newExercises.splice(exerciseIndex, 1);
                          newSections[sectionIndex] = {
                            ...newSections[sectionIndex],
                            exercises: newExercises
                          };
                          return {
                            ...prev,
                            conspect: {
                              ...prev.conspect!,
                              sections: newSections
                            }
                          };
                        });
                      }}
                    >
                      <Trash2 size={16} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                )}
                
                {isEditing ? (
                  <TextInput
                    style={styles.editExerciseDescription}
                    value={exercise.description}
                    onChangeText={(text) => {
                      setTraining(prev => {
                        if (!prev) return prev;
                        const newSections = [...prev.conspect!.sections];
                        const newExercises = [...newSections[sectionIndex].exercises];
                        newExercises[exerciseIndex] = {
                          ...newExercises[exerciseIndex],
                          description: text
                        };
                        newSections[sectionIndex] = {
                          ...newSections[sectionIndex],
                          exercises: newExercises
                        };
                        return {
                          ...prev,
                          conspect: {
                            ...prev.conspect!,
                            sections: newSections
                          }
                        };
                      });
                    }}
                    placeholder="Opis ćwiczenia"
                    placeholderTextColor="#666666"
                    multiline
                  />
                ) : (
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                )}
                
                {exercise.image && (
                  <Image source={{ uri: exercise.image }} style={styles.exerciseImage} />
                )}
              </View>
            ))}
            
            {isEditing && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddExerciseModal(true)}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Dodaj ćwiczenie</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {isEditing && (
          <TouchableOpacity 
            style={styles.addSectionButton}
            onPress={() => setShowAddSectionModal(true)}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Dodaj sekcję</Text>
          </TouchableOpacity>
        )}

        {/* Notes */}
        <View style={styles.conspectSection}>
          <Text style={styles.conspectSectionTitle}>Uwagi i notatki</Text>
          {isEditing ? (
            <TextInput
              style={styles.editNotes}
              value={training.notes}
              onChangeText={(text) => {
                setTraining(prev => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    notes: text
                  };
                });
              }}
              placeholder="Uwagi i notatki"
              placeholderTextColor="#666666"
              multiline
            />
          ) : (
            <Text style={styles.notesText}>{training.notes}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderAttendanceTab = () => {
    return (
      <View style={styles.attendanceContainer}>
        <View style={styles.attendanceStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {players.filter(p => p.status === 'present').length}
            </Text>
            <Text style={styles.statLabel}>Obecnych</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {players.filter(p => p.status === 'absent').length}
            </Text>
            <Text style={styles.statLabel}>Nieobecnych</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {players.filter(p => p.status === 'late').length}
            </Text>
            <Text style={styles.statLabel}>Spóźnionych</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {players.filter(p => p.status === 'unknown').length}
            </Text>
            <Text style={styles.statLabel}>Nieokreślonych</Text>
          </View>
        </View>
        
        <View style={styles.playersList}>
          {players.map(player => (
            <View key={player.id} style={styles.playerItem}>
              <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPosition}>{player.position}</Text>
              </View>
              <View style={styles.statusButtons}>
                <TouchableOpacity 
                  style={[
                    styles.statusButton, 
                    player.status === 'present' && styles.activeStatusButton
                  ]}
                  onPress={() => updatePlayerStatus(player.id, 'present')}
                >
                  <Check size={16} color={player.status === 'present' ? '#FFFFFF' : '#00FF88'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusButton, 
                    player.status === 'absent' && styles.absentButton
                  ]}
                  onPress={() => updatePlayerStatus(player.id, 'absent')}
                >
                  <X size={16} color={player.status === 'absent' ? '#FFFFFF' : '#FF4444'} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.statusButton, 
                    player.status === 'late' && styles.lateButton
                  ]}
                  onPress={() => updatePlayerStatus(player.id, 'late')}
                >
                  <Clock3 size={16} color={player.status === 'late' ? '#FFFFFF' : '#FFD700'} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStatsTab = () => {
    const presentPlayers = players.filter(p => p.status === 'present' || p.status === 'late');
    
    if (presentPlayers.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Users size={48} color="#666666" />
          <Text style={styles.emptyText}>Brak statystyk</Text>
          <Text style={styles.emptySubtext}>
            Statystyki będą dostępne po treningu
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.statsContainer}>
        {presentPlayers.map(player => (
          <View key={player.id} style={styles.playerStatsCard}>
            <View style={styles.playerStatsHeader}>
              <Image source={{ uri: player.avatar }} style={styles.playerStatsAvatar} />
              <View>
                <Text style={styles.playerStatsName}>{player.name}</Text>
                <Text style={styles.playerStatsPosition}>{player.position}</Text>
              </View>
            </View>
            
            {player.stats ? (
              <View style={styles.playerStatsGrid}>
                <View style={styles.statBar}>
                  <Text style={styles.statBarLabel}>Intensywność</Text>
                  <View style={styles.statBarTrack}>
                    <View 
                      style={[
                        styles.statBarFill, 
                        { width: `${player.stats.intensity}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.statBarValue}>{player.stats.intensity}%</Text>
                </View>
                
                <View style={styles.statBar}>
                  <Text style={styles.statBarLabel}>Technika</Text>
                  <View style={styles.statBarTrack}>
                    <View 
                      style={[
                        styles.statBarFill, 
                        { width: `${player.stats.technique}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.statBarValue}>{player.stats.technique}%</Text>
                </View>
                
                <View style={styles.statBar}>
                  <Text style={styles.statBarLabel}>Taktyka</Text>
                  <View style={styles.statBarTrack}>
                    <View 
                      style={[
                        styles.statBarFill, 
                        { width: `${player.stats.tactical}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.statBarValue}>{player.stats.tactical}%</Text>
                </View>
                
                <View style={styles.statBar}>
                  <Text style={styles.statBarLabel}>Fizyczność</Text>
                  <View style={styles.statBarTrack}>
                    <View 
                      style={[
                        styles.statBarFill, 
                        { width: `${player.stats.physical}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.statBarValue}>{player.stats.physical}%</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noStatsMessage}>
                <Text style={styles.noStatsText}>Brak danych statystycznych</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderVideosTab = () => {
    if (!training?.videos || training.videos.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Video size={48} color="#666666" />
          <Text style={styles.emptyText}>Brak filmów</Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Dodaj film</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.videosContainer}>
        {training.videos.map(video => (
          <View key={video.id} style={styles.videoCard}>
            <View style={styles.videoThumbnailContainer}>
              <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
              <TouchableOpacity style={styles.playButton}>
                <Video size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={16} color="#FFFFFF" />
                <Text style={styles.downloadText}>Pobierz</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading || !training) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <SoccerBall size={48} color="#FFFFFF" />
          <Text style={styles.loadingText}>Ładowanie treningu...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{training.title}</Text>
        {activeTab === 'conspect' ? (
          isEditing ? (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveTraining}
            >
              <Save size={24} color="#00FF88" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Training Info */}
        <View style={styles.trainingInfo}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#888888" />
            <Text style={styles.infoText}>{training.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={16} color="#888888" />
            <Text style={styles.infoText}>{training.time} ({training.duration})</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#888888" />
            <Text style={styles.infoText}>{training.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color="#888888" />
            <Text style={styles.infoText}>
              {training.playersConfirmed}/{training.totalPlayers} zawodników
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'conspect' && styles.activeTab
            ]}
            onPress={() => setActiveTab('conspect')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'conspect' && styles.activeTabText
            ]}>
              Konspekt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'attendance' && styles.activeTab
            ]}
            onPress={() => setActiveTab('attendance')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'attendance' && styles.activeTabText
            ]}>
              Obecność
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'stats' && styles.activeTab
            ]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'stats' && styles.activeTabText
            ]}>
              Statystyki
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'videos' && styles.activeTab
            ]}
            onPress={() => setActiveTab('videos')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'videos' && styles.activeTabText
            ]}>
              Filmy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'conspect' && renderConspectTab()}
          {activeTab === 'attendance' && renderAttendanceTab()}
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'videos' && renderVideosTab()}
        </View>
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj ćwiczenie</Text>
              <TouchableOpacity onPress={() => setShowAddExerciseModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Nazwa ćwiczenia</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Wpisz nazwę ćwiczenia"
              placeholderTextColor="#666666"
            />
            
            <Text style={styles.modalLabel}>Opis ćwiczenia</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Wpisz opis ćwiczenia"
              placeholderTextColor="#666666"
              multiline
            />
            
            <TouchableOpacity style={styles.imagePickerButton}>
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.imagePickerText}>Dodaj grafikę</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                // Add exercise logic here
                setShowAddExerciseModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Dodaj ćwiczenie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        visible={showAddSectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dodaj sekcję</Text>
              <TouchableOpacity onPress={() => setShowAddSectionModal(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Nazwa sekcji</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="np. Rozgrzewka, Część główna"
              placeholderTextColor="#666666"
            />
            
            <Text style={styles.modalLabel}>Czas trwania</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="np. 15 min"
              placeholderTextColor="#666666"
            />
            
            <Text style={styles.modalLabel}>Opis</Text>
            <TextInput
              style={[styles.modalInput, styles.textArea]}
              placeholder="Krótki opis sekcji"
              placeholderTextColor="#666666"
              multiline
            />
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                // Add section logic here
                setShowAddSectionModal(false);
              }}
            >
              <Text style={styles.modalButtonText}>Dodaj sekcję</Text>
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
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  trainingInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#888888',
  },
  activeTabText: {
    color: '#000000',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  // Conspect Tab Styles
  conspectContainer: {
    
  },
  conspectSection: {
    marginBottom: 24,
  },
  conspectSectionTitle: {
    fontSize: 18,
    fontFamily: 'Oswald-SemiBold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  conspectText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
    flex: 1,
    lineHeight: 24,
  },
  trainingSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  sectionDuration: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
    marginBottom: 16,
    lineHeight: 20,
  },
  exercise: {
    marginBottom: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#AAAAAA',
    marginBottom: 8,
    lineHeight: 20,
  },
  exerciseImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#DDDDDD',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  // Edit Mode Styles
  editInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  editListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editListInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  editSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  editSectionTitle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  editSectionDuration: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    width: 80,
    marginRight: 8,
  },
  editSectionDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editExerciseName: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  editExerciseDescription: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  editNotes: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Attendance Tab Styles
  attendanceContainer: {
    
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Oswald-Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  playersList: {
    
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playerPosition: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeStatusButton: {
    backgroundColor: '#00FF88',
  },
  absentButton: {
    backgroundColor: '#FF4444',
  },
  lateButton: {
    backgroundColor: '#FFD700',
  },
  // Stats Tab Styles
  statsContainer: {
    
  },
  playerStatsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  playerStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerStatsAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  playerStatsName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  playerStatsPosition: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
  },
  playerStatsGrid: {
    
  },
  statBar: {
    marginBottom: 12,
  },
  statBarLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginBottom: 4,
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 4,
  },
  statBarValue: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    textAlign: 'right',
  },
  noStatsMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noStatsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#888888',
    fontStyle: 'italic',
  },
  // Videos Tab Styles
  videosContainer: {
    
  },
  videoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoThumbnailContainer: {
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: 180,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  downloadText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  // Modal Styles
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
  modalLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  imagePickerText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  modalButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
});