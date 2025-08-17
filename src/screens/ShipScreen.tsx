import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGame } from '../context/GameContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const ShipScreen: React.FC = () => {
  const { ship, credits, updateCredits } = useGame();
  const [selectedTab, setSelectedTab] = useState<'stats' | 'upgrades' | 'rename'>('stats');
  const [newShipName, setNewShipName] = useState(ship?.name || '');

  const getUpgradeCost = (currentLevel: number) => {
    return Math.floor(1000 * Math.pow(1.4, currentLevel));
  };

  const handleUpgrade = (stat: string, currentValue: number) => {
    const cost = getUpgradeCost(currentValue);
    
    if (credits < cost) {
      Alert.alert('Insufficient Credits', `You need ${cost.toLocaleString()} credits for this upgrade.`);
      return;
    }

    Alert.alert(
      'Upgrade Confirmation',
      `Upgrade ${stat} for ${cost.toLocaleString()} credits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => {
            updateCredits(-cost);
            Alert.alert('Upgrade Complete', `${stat} has been upgraded successfully!`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleRename = () => {
    if (!newShipName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid ship name.');
      return;
    }

    const cost = 500;
    if (credits < cost) {
      Alert.alert('Insufficient Credits', `Renaming costs ${cost} credits.`);
      return;
    }

    Alert.alert(
      'Rename Ship',
      `Rename your ship to "${newShipName}" for ${cost} credits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: () => {
            updateCredits(-cost);
            Alert.alert('Ship Renamed', `Your ship is now called "${newShipName}".`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  if (!ship) {
    return (
      <View style={styles.container}>
        <Text style={[typography.body, styles.emptyText]}>
          No ship data available.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Ship Header */}
      <View style={styles.header}>
        <View style={styles.shipIcon}>
          <Ionicons name="rocket" size={32} color={colors.primary} />
        </View>
        <View style={styles.shipInfo}>
          <Text style={[typography.h3, styles.shipName]}>{ship.name}</Text>
          <Text style={[typography.bodySecondary, styles.shipClass]}>
            {ship.classKey.replace('_', ' ').toUpperCase()}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: ship.status === 'OK' ? colors.success + '20' : colors.error + '20' }
          ]}>
            <Text style={[
              typography.caption,
              { color: ship.status === 'OK' ? colors.success : colors.error }
            ]}>
              {ship.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'stats' && styles.activeTab]}
          onPress={() => setSelectedTab('stats')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'stats' && styles.activeTabText
          ]}>
            Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'upgrades' && styles.activeTab]}
          onPress={() => setSelectedTab('upgrades')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'upgrades' && styles.activeTabText
          ]}>
            Upgrades
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rename' && styles.activeTab]}
          onPress={() => setSelectedTab('rename')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'rename' && styles.activeTabText
          ]}>
            Rename
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'stats' && (
          <View style={styles.statsPanel}>
            <Text style={[typography.h4, styles.sectionTitle]}>Ship Statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="cube" size={24} color={colors.primary} />
                <Text style={[typography.caption, styles.statLabel]}>Cargo Holds</Text>
                <Text style={[typography.h3, styles.statValue]}>{ship.holds}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="shield" size={24} color={colors.accent} />
                <Text style={[typography.caption, styles.statLabel]}>Shields</Text>
                <Text style={[typography.h3, styles.statValue]}>{ship.shields}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="airplane" size={24} color={colors.warning} />
                <Text style={[typography.caption, styles.statLabel]}>Fighters</Text>
                <Text style={[typography.h3, styles.statValue]}>{ship.fighters}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="nuclear" size={24} color={colors.error} />
                <Text style={[typography.caption, styles.statLabel]}>Torpedoes</Text>
                <Text style={[typography.h3, styles.statValue]}>{ship.torps}</Text>
              </View>
            </View>

            <View style={styles.specialAbility}>
              <Text style={[typography.h4, styles.abilityTitle]}>Special Ability</Text>
              <Text style={[typography.bodySecondary, styles.abilityDescription]}>
                Cheap Repairs: Repair costs reduced by 15%
              </Text>
            </View>
          </View>
        )}

        {selectedTab === 'upgrades' && (
          <View style={styles.upgradesPanel}>
            <Text style={[typography.h4, styles.sectionTitle]}>Ship Upgrades</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Enhance your ship's capabilities with permanent upgrades
            </Text>

            <View style={styles.upgradesList}>
              {[
                { name: 'Cargo Holds', current: ship.holds, icon: 'cube', color: colors.primary },
                { name: 'Shields', current: ship.shields, icon: 'shield', color: colors.accent },
                { name: 'Fighters', current: ship.fighters, icon: 'airplane', color: colors.warning },
                { name: 'Torpedoes', current: ship.torps, icon: 'nuclear', color: colors.error },
              ].map((upgrade) => (
                <View key={upgrade.name} style={styles.upgradeItem}>
                  <View style={styles.upgradeInfo}>
                    <Ionicons name={upgrade.icon as any} size={24} color={upgrade.color} />
                    <View style={styles.upgradeDetails}>
                      <Text style={[typography.h4, styles.upgradeName]}>{upgrade.name}</Text>
                      <Text style={[typography.caption, styles.upgradeLevel]}>
                        Current: {upgrade.current}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => handleUpgrade(upgrade.name, upgrade.current)}
                  >
                    <Text style={[typography.button, styles.upgradeButtonText]}>
                      {getUpgradeCost(upgrade.current).toLocaleString()} CR
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {selectedTab === 'rename' && (
          <View style={styles.renamePanel}>
            <Text style={[typography.h4, styles.sectionTitle]}>Rename Ship</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Give your ship a new identity for 500 credits
            </Text>

            <View style={styles.renameForm}>
              <TextInput
                style={styles.nameInput}
                placeholder="Enter new ship name"
                placeholderTextColor={colors.textMuted}
                value={newShipName}
                onChangeText={setNewShipName}
                maxLength={30}
              />
              
              <TouchableOpacity
                style={styles.renameButton}
                onPress={handleRename}
              >
                <Text style={[typography.button, styles.renameButtonText]}>
                  Rename for 500 CR
                </Text>
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shipIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shipInfo: {
    flex: 1,
  },
  shipName: {
    color: colors.text,
    marginBottom: 4,
  },
  shipClass: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  statsPanel: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  sectionSubtitle: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    color: colors.text,
  },
  specialAbility: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  abilityTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  abilityDescription: {
    lineHeight: 20,
  },
  upgradesPanel: {
    padding: 20,
  },
  upgradesList: {
    gap: 16,
  },
  upgradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upgradeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upgradeDetails: {
    marginLeft: 16,
  },
  upgradeName: {
    color: colors.text,
    marginBottom: 4,
  },
  upgradeLevel: {
    color: colors.textMuted,
  },
  upgradeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: colors.text,
  },
  renamePanel: {
    padding: 20,
  },
  renameForm: {
    gap: 16,
  },
  nameInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  renameButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  renameButtonText: {
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 100,
  },
});

export default ShipScreen;