import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface Mission {
  id: string;
  title: string;
  faction: 'Federation' | 'Pirate' | 'Neutral';
  tier: 'I' | 'II' | 'III' | 'IV' | 'V';
  type: string;
  description: string;
  region: string;
  rewards: {
    credits: number;
    repXP: number;
    alignment: number;
  };
  timeLimit: number; // minutes
  status: 'offered' | 'accepted' | 'completed' | 'failed';
}

const MissionsScreen: React.FC = () => {
  const { credits, updateCredits } = useGame();
  const [selectedTab, setSelectedTab] = useState<'offers' | 'active' | 'history'>('offers');

  const missionOffers: Mission[] = [
    {
      id: 'mission_1',
      title: 'Relief Shipment',
      faction: 'Federation',
      tier: 'II',
      type: 'Delivery',
      description: 'Deliver aid crates to a colony in the Frontier Cluster.',
      region: 'Frontier Cluster',
      rewards: { credits: 5000, repXP: 200, alignment: 15 },
      timeLimit: 120,
      status: 'offered',
    },
    {
      id: 'mission_2',
      title: 'Black Line Run',
      faction: 'Pirate',
      tier: 'I',
      type: 'Smuggle',
      description: 'Move contraband between two outlaw markets.',
      region: 'Pirate Reaches',
      rewards: { credits: 8000, repXP: 150, alignment: -10 },
      timeLimit: 90,
      status: 'offered',
    },
    {
      id: 'mission_3',
      title: 'Recon Sweep',
      faction: 'Neutral',
      tier: 'I',
      type: 'Recon',
      description: 'Scan and report anomalies in the Core Ring.',
      region: 'Core Ring',
      rewards: { credits: 3000, repXP: 120, alignment: 0 },
      timeLimit: 60,
      status: 'offered',
    },
  ];

  const activeMissions: Mission[] = [];
  const missionHistory: Mission[] = [];

  const getFactionColor = (faction: string) => {
    switch (faction) {
      case 'Federation': return colors.federation;
      case 'Pirate': return colors.pirate;
      default: return colors.neutral;
    }
  };

  const getTierColor = (tier: string) => {
    const tierNum = ['I', 'II', 'III', 'IV', 'V'].indexOf(tier) + 1;
    if (tierNum <= 2) return colors.success;
    if (tierNum <= 3) return colors.warning;
    return colors.error;
  };

  const handleAcceptMission = (mission: Mission) => {
    Alert.alert(
      'Accept Mission',
      `Accept "${mission.title}"? This mission has a ${mission.timeLimit} minute time limit.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            Alert.alert('Mission Accepted', `You have accepted "${mission.title}". Good luck!`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const renderMissionCard = (mission: Mission, showActions: boolean = true) => (
    <View key={mission.id} style={styles.missionCard}>
      <View style={styles.missionHeader}>
        <View style={styles.missionTitleRow}>
          <Text style={[typography.h4, styles.missionTitle]}>{mission.title}</Text>
          <View style={[styles.tierBadge, { backgroundColor: getTierColor(mission.tier) }]}>
            <Text style={[typography.caption, styles.tierText]}>Tier {mission.tier}</Text>
          </View>
        </View>
        
        <View style={styles.missionMeta}>
          <View style={[styles.factionBadge, { backgroundColor: getFactionColor(mission.faction) + '20' }]}>
            <Text style={[typography.caption, { color: getFactionColor(mission.faction) }]}>
              {mission.faction}
            </Text>
          </View>
          <Text style={[typography.caption, styles.missionType]}>{mission.type}</Text>
        </View>
      </View>

      <Text style={[typography.bodySecondary, styles.missionDescription]}>
        {mission.description}
      </Text>

      <View style={styles.missionDetails}>
        <View style={styles.missionDetail}>
          <Ionicons name="location" size={16} color={colors.textMuted} />
          <Text style={[typography.caption, styles.detailText]}>{mission.region}</Text>
        </View>
        <View style={styles.missionDetail}>
          <Ionicons name="time" size={16} color={colors.textMuted} />
          <Text style={[typography.caption, styles.detailText]}>{mission.timeLimit}m limit</Text>
        </View>
      </View>

      <View style={styles.rewards}>
        <View style={styles.reward}>
          <Ionicons name="diamond" size={16} color={colors.accent} />
          <Text style={[typography.caption, styles.rewardText]}>
            {mission.rewards.credits.toLocaleString()} CR
          </Text>
        </View>
        <View style={styles.reward}>
          <Ionicons name="star" size={16} color={colors.warning} />
          <Text style={[typography.caption, styles.rewardText]}>
            {mission.rewards.repXP} XP
          </Text>
        </View>
        {mission.rewards.alignment !== 0 && (
          <View style={styles.reward}>
            <Ionicons 
              name={mission.rewards.alignment > 0 ? "arrow-up" : "arrow-down"} 
              size={16} 
              color={mission.rewards.alignment > 0 ? colors.success : colors.error} 
            />
            <Text style={[typography.caption, styles.rewardText]}>
              {Math.abs(mission.rewards.alignment)} Align
            </Text>
          </View>
        )}
      </View>

      {showActions && (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptMission(mission)}
        >
          <Text style={[typography.button, styles.acceptButtonText]}>Accept Mission</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'offers' && styles.activeTab]}
          onPress={() => setSelectedTab('offers')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'offers' && styles.activeTabText
          ]}>
            Offers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'active' && styles.activeTabText
          ]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.activeTab]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'history' && styles.activeTabText
          ]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'offers' && (
          <View style={styles.offersPanel}>
            <Text style={[typography.h3, styles.sectionTitle]}>Mission Offers</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Choose from available missions across the galaxy
            </Text>

            {missionOffers.map((mission) => renderMissionCard(mission, true))}
          </View>
        )}

        {selectedTab === 'active' && (
          <View style={styles.activePanel}>
            <Text style={[typography.h3, styles.sectionTitle]}>Active Missions</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Track your current mission progress
            </Text>

            {activeMissions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="list-outline" size={64} color={colors.textMuted} />
                <Text style={[typography.h4, styles.emptyTitle]}>No Active Missions</Text>
                <Text style={[typography.bodySecondary, styles.emptyText]}>
                  Accept a mission from the Offers tab to get started.
                </Text>
              </View>
            ) : (
              activeMissions.map((mission) => renderMissionCard(mission, false))
            )}
          </View>
        )}

        {selectedTab === 'history' && (
          <View style={styles.historyPanel}>
            <Text style={[typography.h3, styles.sectionTitle]}>Mission History</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Review your completed and failed missions
            </Text>

            {missionHistory.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color={colors.textMuted} />
                <Text style={[typography.h4, styles.emptyTitle]}>No Mission History</Text>
                <Text style={[typography.bodySecondary, styles.emptyText]}>
                  Complete missions to build your reputation and history.
                </Text>
              </View>
            ) : (
              missionHistory.map((mission) => renderMissionCard(mission, false))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
  offersPanel: {
    padding: 20,
  },
  activePanel: {
    padding: 20,
  },
  historyPanel: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  sectionSubtitle: {
    marginBottom: 24,
  },
  missionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  missionHeader: {
    marginBottom: 12,
  },
  missionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    flex: 1,
    color: colors.text,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    color: colors.text,
    fontWeight: '600',
  },
  missionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missionType: {
    color: colors.textMuted,
  },
  missionDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  missionDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  missionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: colors.textMuted,
  },
  rewards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    color: colors.textSecondary,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default MissionsScreen;