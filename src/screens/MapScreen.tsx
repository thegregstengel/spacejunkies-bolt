import React from 'react';
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

const MapScreen: React.FC = () => {
  const { currentSector, turns, credits, moveTo, updateTurns } = useGame();

  const handleMove = async (sectorId: string) => {
    if (turns <= 0) {
      Alert.alert('No Turns', 'You are out of turns. Wait for the daily reset at 00:00 UTC.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Alert.alert(
      'Move Confirmation',
      `Move to Sector ${sectorId.split('_')[1]}? This will cost 1 turn.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: async () => {
            await moveTo(sectorId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  const handleScan = () => {
    if (turns <= 0) {
      Alert.alert('No Turns', 'You are out of turns.');
      return;
    }

    Alert.alert(
      'Scan Sector',
      'Scan for nearby ports and anomalies? This will cost 1 turn.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Scan',
          onPress: () => {
            updateTurns(-1);
            Alert.alert('Scan Results', 'No significant anomalies detected in nearby sectors.');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  const handleDock = () => {
    if (!currentSector?.hasPort) {
      Alert.alert('No Port', 'There is no port in this sector.');
      return;
    }

    if (turns <= 0) {
      Alert.alert('No Turns', 'You are out of turns.');
      return;
    }

    Alert.alert(
      'Dock at Port',
      'Dock at the local port? This will cost 1 turn.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dock',
          onPress: () => {
            updateTurns(-1);
            Alert.alert('Docked', 'You have successfully docked at the port.');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  if (!currentSector) {
    return (
      <View style={styles.container}>
        <Text style={[typography.body, styles.emptyText]}>
          Loading sector data...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={[typography.caption, styles.regionText]}>
            {currentSector.region}
          </Text>
          <Text style={[typography.h2, styles.sectorName]}>
            {currentSector.name}
          </Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[typography.caption, styles.statLabel]}>Turns</Text>
            <Text style={[typography.h4, styles.statValue, { color: turns > 50 ? colors.success : colors.warning }]}>
              {turns}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[typography.caption, styles.statLabel]}>Credits</Text>
            <Text style={[typography.h4, styles.statValue]}>
              {credits.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Sector Info */}
      <View style={styles.sectorPanel}>
        <View style={styles.sectorFeatures}>
          {currentSector.hasPort && (
            <View style={[styles.feature, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="business" size={16} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.primary }]}>Port</Text>
            </View>
          )}
          {currentSector.hasPlanet && (
            <View style={[styles.feature, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="planet" size={16} color={colors.accent} />
              <Text style={[typography.caption, { color: colors.accent }]}>Planet</Text>
            </View>
          )}
          {currentSector.players > 0 && (
            <View style={[styles.feature, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="people" size={16} color={colors.warning} />
              <Text style={[typography.caption, { color: colors.warning }]}>
                {currentSector.players} Player{currentSector.players > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.scanButton]}
            onPress={handleScan}
            disabled={turns <= 0}
          >
            <Ionicons name="scan" size={20} color={colors.text} />
            <Text style={[typography.button, styles.actionButtonText]}>
              Scan (1 turn)
            </Text>
          </TouchableOpacity>

          {currentSector.hasPort && (
            <TouchableOpacity
              style={[styles.actionButton, styles.dockButton]}
              onPress={handleDock}
              disabled={turns <= 0}
            >
              <Ionicons name="business" size={20} color={colors.text} />
              <Text style={[typography.button, styles.actionButtonText]}>
                Dock (1 turn)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Connected Sectors */}
      <View style={styles.connectionsPanel}>
        <Text style={[typography.h4, styles.connectionsTitle]}>
          Connected Sectors
        </Text>
        <View style={styles.sectorChips}>
          {currentSector.connectedSectors.map((sectorId) => (
            <TouchableOpacity
              key={sectorId}
              style={[
                styles.sectorChip,
                turns <= 0 && styles.sectorChipDisabled
              ]}
              onPress={() => handleMove(sectorId)}
              disabled={turns <= 0}
            >
              <Text style={[
                typography.body,
                styles.sectorChipText,
                turns <= 0 && styles.sectorChipTextDisabled
              ]}>
                Sector {sectorId.split('_')[1]}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={turns <= 0 ? colors.disabled : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {turns <= 0 && (
        <View style={styles.noTurnsWarning}>
          <Ionicons name="warning" size={24} color={colors.warning} />
          <Text style={[typography.body, styles.warningText]}>
            Out of turns! Turns reset daily at 00:00 UTC.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: colors.surface,
  },
  headerInfo: {
    flex: 1,
  },
  regionText: {
    color: colors.primary,
    marginBottom: 4,
  },
  sectorName: {
    color: colors.text,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
  },
  sectorPanel: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectorFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  scanButton: {
    backgroundColor: colors.secondary,
  },
  dockButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.text,
  },
  connectionsPanel: {
    margin: 20,
    marginTop: 0,
  },
  connectionsTitle: {
    marginBottom: 16,
    color: colors.text,
  },
  sectorChips: {
    gap: 12,
  },
  sectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectorChipDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  sectorChipText: {
    color: colors.text,
  },
  sectorChipTextDisabled: {
    color: colors.textMuted,
  },
  noTurnsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    margin: 20,
    padding: 16,
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  warningText: {
    flex: 1,
    color: colors.warning,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 100,
  },
});

export default MapScreen;