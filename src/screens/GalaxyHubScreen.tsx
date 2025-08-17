import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface GalaxyOption {
  id: string;
  name: string;
  type: 'Friendly' | 'Standard' | 'Pirate';
  description: string;
  players: number;
  difficulty: string;
}

const galaxyOptions: GalaxyOption[] = [
  {
    id: 'galaxy_friendly',
    name: 'Peaceful Sector',
    type: 'Friendly',
    description: 'PvP disabled, perfect for learning the ropes',
    players: 1247,
    difficulty: 'Easy',
  },
  {
    id: 'galaxy_standard',
    name: 'Core Galaxy',
    type: 'Standard',
    description: 'Balanced gameplay with optional PvP zones',
    players: 3891,
    difficulty: 'Medium',
  },
  {
    id: 'galaxy_pirate',
    name: 'Lawless Expanse',
    type: 'Pirate',
    description: 'Full PvP, high risk and high reward',
    players: 2156,
    difficulty: 'Hard',
  },
];

const GalaxyHubScreen: React.FC = () => {
  const { updateProfile } = useAuth();
  const { initializeGame } = useGame();

  const handleJoinGalaxy = async (galaxy: GalaxyOption) => {
    Alert.alert(
      'Join Galaxy',
      `Are you sure you want to join ${galaxy.name}? This choice is permanent for this character.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join',
          onPress: async () => {
            await updateProfile({ galaxyId: galaxy.id });
            await initializeGame();
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return colors.success;
      case 'Medium': return colors.warning;
      case 'Hard': return colors.error;
      default: return colors.neutral;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Friendly': return colors.success;
      case 'Standard': return colors.primary;
      case 'Pirate': return colors.pirate;
      default: return colors.neutral;
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[typography.h1, styles.title]}>Choose Your Galaxy</Text>
          <Text style={[typography.bodySecondary, styles.subtitle]}>
            Select a galaxy to begin your journey. This choice is permanent.
          </Text>
        </View>

        <View style={styles.galaxyList}>
          {galaxyOptions.map((galaxy) => (
            <TouchableOpacity
              key={galaxy.id}
              style={styles.galaxyCard}
              onPress={() => handleJoinGalaxy(galaxy)}
            >
              <View style={styles.cardHeader}>
                <Text style={[typography.h3, styles.galaxyName]}>
                  {galaxy.name}
                </Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(galaxy.type) }]}>
                  <Text style={[typography.caption, styles.badgeText]}>
                    {galaxy.type}
                  </Text>
                </View>
              </View>

              <Text style={[typography.bodySecondary, styles.description]}>
                {galaxy.description}
              </Text>

              <View style={styles.cardFooter}>
                <View style={styles.stat}>
                  <Text style={[typography.caption, styles.statLabel]}>Players</Text>
                  <Text style={[typography.body, styles.statValue]}>
                    {galaxy.players.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[typography.caption, styles.statLabel]}>Difficulty</Text>
                  <Text style={[
                    typography.body,
                    styles.statValue,
                    { color: getDifficultyColor(galaxy.difficulty) }
                  ]}>
                    {galaxy.difficulty}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.warning}>
          <Text style={[typography.caption, styles.warningText]}>
            ⚠️ Joining a galaxy binds your progress to that instance. Choose carefully!
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  galaxyList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  galaxyCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galaxyName: {
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '600',
  },
  warning: {
    margin: 24,
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  warningText: {
    textAlign: 'center',
    color: colors.warning,
  },
});

export default GalaxyHubScreen;