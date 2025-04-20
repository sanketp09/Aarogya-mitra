
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as Speech from 'expo-speech';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Define game types
interface Game {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  screen?: string;
}

const GamesScreen = () => {
  const { colors, fontSize } = useTheme();
  const [games, setGames] = useState<Game[]>([]);
  
  useEffect(() => {
    // Initialize games
    const availableGames: Game[] = [
      {
        id: '1',
        title: 'Memory Match',
        description: 'Match pairs of cards to test your visual memory',
        icon: <Ionicons name="grid" size={40} color={colors.primary} />,
        difficulty: 'Easy',
        screen: 'MemoryMatch',
      },
      {
        id: '2',
        title: 'Word Recall',
        description: 'Remember and recall a list of words',
        icon: <Ionicons name="text" size={40} color={colors.primary} />,
        difficulty: 'Medium',
        screen: 'WordRecall',
      },
      {
        id: '3',
        title: 'Number Sequence',
        description: 'Remember and repeat sequences of numbers',
        icon: <MaterialCommunityIcons name="numeric" size={40} color={colors.primary} />,
        difficulty: 'Medium',
        screen: 'NumberSequence',
      },
      {
        id: '4',
        title: 'Pattern Recognition',
        description: 'Identify and complete visual patterns',
        icon: <MaterialCommunityIcons name="shape" size={40} color={colors.primary} />,
        difficulty: 'Hard',
        screen: 'PatternRecognition',
      },
      {
        id: '5',
        title: 'Word Puzzles',
        description: 'Solve word puzzles to enhance vocabulary',
        icon: <MaterialCommunityIcons name="crosshairs-question" size={40} color={colors.primary} />,
        difficulty: 'Medium',
        screen: 'WordPuzzles',
      },
      {
        id: '6',
        title: 'Spatial Reasoning',
        description: 'Test and improve your spatial awareness',
        icon: <MaterialCommunityIcons name="cube-outline" size={40} color={colors.primary} />,
        difficulty: 'Hard',
        screen: 'SpatialReasoning',
      },
    ];
    
    setGames(availableGames);
    
    // Introduce the games screen with voice
    const introduction = "Welcome to Memory Games. Choose a game to keep your mind active and sharp.";
    Speech.speak(introduction, {
      rate: 0.9,
      pitch: 1.0,
    });
  }, [colors.primary]);
  
  const renderGameItem = ({ item }: { item: Game }) => {
    const difficultyColor = 
      item.difficulty === 'Easy' ? '#4CAF50' :
      item.difficulty === 'Medium' ? '#FF9800' : '#F44336';
    
    return (
      <TouchableOpacity
        style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          if (item.screen) {
            // Navigation would go here in a complete app
            Alert.alert('Game Selected', `Starting ${item.title}`);
          }
        }}
      >
        <View style={styles.gameIconContainer}>
          {item.icon}
        </View>
        <Text style={[styles.gameTitle, { color: colors.text, fontSize: fontSize.medium }]}>
          {item.title}
        </Text>
        <Text style={[styles.gameDescription, { color: colors.text, fontSize: fontSize.small }]}>
          {item.description}
        </Text>
        <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
          <Text style={[styles.difficultyText, { fontSize: fontSize.small }]}>
            {item.difficulty}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text, fontSize: fontSize.large }]}>
        Memory Games
      </Text>
      <Text style={[styles.subheader, { color: colors.text, fontSize: fontSize.small }]}>
        Exercise your brain with these cognitive games
      </Text>
      
      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gameRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gameList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    marginBottom: 24,
    opacity: 0.7,
  },
  gameList: {
    paddingBottom: 20,
  },
  gameRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gameCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    position: 'relative',
  },
  gameIconContainer: {
    marginBottom: 12,
  },
  gameTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  gameDescription: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 12,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});

export default GamesScreen;
