import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface FeedItem {
  id: string;
  category: 'combat' | 'economy' | 'mission' | 'planet' | 'season' | 'system';
  region: string;
  message: string;
  timestamp: Date;
  severity: 'minor' | 'standard' | 'major' | 'critical';
}

const FeedScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const feedItems: FeedItem[] = [
    {
      id: 'feed_1',
      category: 'combat',
      region: 'Outer Rim',
      message: 'A decisive clash echoed through the Outer Rim.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      severity: 'major',
    },
    {
      id: 'feed_2',
      category: 'economy',
      region: 'Inner Belt',
      message: 'Equipment demand surged across the Inner Belt.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      severity: 'standard',
    },
    {
      id: 'feed_3',
      category: 'mission',
      region: 'Frontier Cluster',
      message: 'A convoy reached safe harbor despite pirate pressure.',
      timestamp: new Date(Date.now() - 32 * 60 * 1000), // 32 minutes ago
      severity: 'standard',
    },
    {
      id: 'feed_4',
      category: 'planet',
      region: 'Deep Space',
      message: 'A new world was charted in Deep Space.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      severity: 'major',
    },
    {
      id: 'feed_5',
      category: 'economy',
      region: 'Pirate Reaches',
      message: 'A Black Market in the Pirate Reaches opened for business.',
      timestamp: new Date(Date.now() - 67 * 60 * 1000), // 1 hour 7 minutes ago
      severity: 'minor',
    },
    {
      id: 'feed_6',
      category: 'system',
      region: 'Galaxy-wide',
      message: 'Turns will reset at 00:00 UTC.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      severity: 'critical',
    },
  ];

  const filters = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'combat', label: 'Combat', icon: 'flash' },
    { key: 'economy', label: 'Economy', icon: 'trending-up' },
    { key: 'mission', label: 'Missions', icon: 'checkmark-circle' },
    { key: 'planet', label: 'Planets', icon: 'planet' },
    { key: 'system', label: 'System', icon: 'settings' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return colors.error;
      case 'economy': return colors.accent;
      case 'mission': return colors.primary;
      case 'planet': return colors.success;
      case 'system': return colors.warning;
      default: return colors.neutral;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'major': return colors.warning;
      case 'standard': return colors.primary;
      case 'minor': return colors.textMuted;
      default: return colors.neutral;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const filteredItems = selectedFilter === 'all' 
    ? feedItems 
    : feedItems.filter(item => item.category === selectedFilter);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && styles.activeFilterTab
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={selectedFilter === filter.key ? colors.text : colors.textMuted} 
            />
            <Text style={[
              typography.caption,
              styles.filterText,
              selectedFilter === filter.key && styles.activeFilterText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed Items */}
      <ScrollView 
        style={styles.feedList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {filteredItems.map((item) => (
          <View key={item.id} style={styles.feedItem}>
            <View style={styles.feedItemHeader}>
              <View style={styles.feedItemMeta}>
                <View style={[
                  styles.categoryBadge,
                  { backgroundColor: getCategoryColor(item.category) + '20' }
                ]}>
                  <Text style={[
                    typography.caption,
                    { color: getCategoryColor(item.category) }
                  ]}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>
                <Text style={[typography.caption, styles.regionText]}>
                  {item.region}
                </Text>
              </View>
              
              <View style={styles.feedItemTime}>
                <View style={[
                  styles.severityIndicator,
                  { backgroundColor: getSeverityColor(item.severity) }
                ]} />
                <Text style={[typography.caption, styles.timestampText]}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </View>
            </View>

            <Text style={[typography.body, styles.feedMessage]}>
              {item.message}
            </Text>
          </View>
        ))}

        {filteredItems.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={64} color={colors.textMuted} />
            <Text style={[typography.h4, styles.emptyTitle]}>No Feed Items</Text>
            <Text style={[typography.bodySecondary, styles.emptyText]}>
              No events match the selected filter. Try a different category.
            </Text>
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
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textMuted,
  },
  activeFilterText: {
    color: colors.text,
  },
  feedList: {
    flex: 1,
  },
  feedItem: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  regionText: {
    color: colors.textSecondary,
  },
  feedItemTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timestampText: {
    color: colors.textMuted,
  },
  feedMessage: {
    color: colors.text,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default FeedScreen;