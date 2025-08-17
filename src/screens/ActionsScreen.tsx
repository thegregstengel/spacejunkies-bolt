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

interface TradeItem {
  commodity: string;
  price: number;
  stock: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const ActionsScreen: React.FC = () => {
  const { currentSector, credits, updateCredits } = useGame();
  const [selectedTab, setSelectedTab] = useState<'trade' | 'bank' | 'shipyard'>('trade');
  const [bankAmount, setBankAmount] = useState('');

  const tradeItems: TradeItem[] = [
    { commodity: 'Fuel', price: 12, stock: 1500, icon: 'flash' },
    { commodity: 'Organics', price: 18, stock: 800, icon: 'leaf' },
    { commodity: 'Equipment', price: 35, stock: 450, icon: 'construct' },
  ];

  const handleTrade = (item: TradeItem, action: 'buy' | 'sell') => {
    const amount = action === 'buy' ? -item.price : item.price * 0.8;
    const actionText = action === 'buy' ? 'Buy' : 'Sell';
    
    Alert.alert(
      `${actionText} ${item.commodity}`,
      `${actionText} 1 unit of ${item.commodity} for ${Math.abs(amount)} credits?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          onPress: () => {
            if (action === 'buy' && credits < item.price) {
              Alert.alert('Insufficient Credits', 'You do not have enough credits for this purchase.');
              return;
            }
            updateCredits(amount);
            Alert.alert('Trade Complete', `${actionText} completed successfully.`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
      ]
    );
  };

  const handleBankTransaction = (action: 'deposit' | 'withdraw') => {
    const amount = parseInt(bankAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (action === 'deposit' && credits < amount) {
      Alert.alert('Insufficient Credits', 'You do not have enough credits.');
      return;
    }

    const delta = action === 'deposit' ? -amount : amount;
    updateCredits(delta);
    setBankAmount('');
    Alert.alert('Transaction Complete', `${action === 'deposit' ? 'Deposited' : 'Withdrew'} ${amount} credits.`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!currentSector?.hasPort) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={64} color={colors.textMuted} />
          <Text style={[typography.h3, styles.emptyTitle]}>No Port Available</Text>
          <Text style={[typography.bodySecondary, styles.emptyText]}>
            You need to be at a port to access trading and banking services.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trade' && styles.activeTab]}
          onPress={() => setSelectedTab('trade')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'trade' && styles.activeTabText
          ]}>
            Trade
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'bank' && styles.activeTab]}
          onPress={() => setSelectedTab('bank')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'bank' && styles.activeTabText
          ]}>
            Bank
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'shipyard' && styles.activeTab]}
          onPress={() => setSelectedTab('shipyard')}
        >
          <Text style={[
            typography.button,
            styles.tabText,
            selectedTab === 'shipyard' && styles.activeTabText
          ]}>
            Shipyard
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'trade' && (
          <View style={styles.tradePanel}>
            <Text style={[typography.h3, styles.sectionTitle]}>Port Trading</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Buy and sell commodities at current market prices
            </Text>

            {tradeItems.map((item) => (
              <View key={item.commodity} style={styles.tradeItem}>
                <View style={styles.tradeItemHeader}>
                  <View style={styles.tradeItemInfo}>
                    <Ionicons name={item.icon} size={24} color={colors.primary} />
                    <View style={styles.tradeItemDetails}>
                      <Text style={[typography.h4, styles.commodityName]}>
                        {item.commodity}
                      </Text>
                      <Text style={[typography.caption, styles.commodityStock]}>
                        Stock: {item.stock.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[typography.h4, styles.price]}>
                    {item.price} CR
                  </Text>
                </View>

                <View style={styles.tradeActions}>
                  <TouchableOpacity
                    style={[styles.tradeButton, styles.buyButton]}
                    onPress={() => handleTrade(item, 'buy')}
                  >
                    <Text style={[typography.button, styles.tradeButtonText]}>
                      Buy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tradeButton, styles.sellButton]}
                    onPress={() => handleTrade(item, 'sell')}
                  >
                    <Text style={[typography.button, styles.tradeButtonText]}>
                      Sell
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'bank' && (
          <View style={styles.bankPanel}>
            <Text style={[typography.h3, styles.sectionTitle]}>Banking Services</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Secure your credits in the galactic banking network
            </Text>

            <View style={styles.bankStats}>
              <View style={styles.bankStat}>
                <Text style={[typography.caption, styles.bankStatLabel]}>Wallet</Text>
                <Text style={[typography.h4, styles.bankStatValue]}>
                  {credits.toLocaleString()} CR
                </Text>
              </View>
              <View style={styles.bankStat}>
                <Text style={[typography.caption, styles.bankStatLabel]}>Bank</Text>
                <Text style={[typography.h4, styles.bankStatValue]}>
                  0 CR
                </Text>
              </View>
            </View>

            <View style={styles.bankForm}>
              <TextInput
                style={styles.bankInput}
                placeholder="Enter amount"
                placeholderTextColor={colors.textMuted}
                value={bankAmount}
                onChangeText={setBankAmount}
                keyboardType="numeric"
              />
              <View style={styles.bankButtons}>
                <TouchableOpacity
                  style={[styles.bankButton, styles.depositButton]}
                  onPress={() => handleBankTransaction('deposit')}
                >
                  <Text style={[typography.button, styles.bankButtonText]}>
                    Deposit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bankButton, styles.withdrawButton]}
                  onPress={() => handleBankTransaction('withdraw')}
                >
                  <Text style={[typography.button, styles.bankButtonText]}>
                    Withdraw
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {selectedTab === 'shipyard' && (
          <View style={styles.shipyardPanel}>
            <Text style={[typography.h3, styles.sectionTitle]}>Shipyard</Text>
            <Text style={[typography.bodySecondary, styles.sectionSubtitle]}>
              Upgrade your ship or purchase a new vessel
            </Text>

            <View style={styles.comingSoon}>
              <Ionicons name="construct-outline" size={64} color={colors.textMuted} />
              <Text style={[typography.h4, styles.comingSoonTitle]}>Coming Soon</Text>
              <Text style={[typography.bodySecondary, styles.comingSoonText]}>
                Ship purchasing and upgrades will be available in a future update.
              </Text>
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
  tradePanel: {
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  sectionSubtitle: {
    marginBottom: 24,
  },
  tradeItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tradeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tradeItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tradeItemDetails: {
    gap: 4,
  },
  commodityName: {
    color: colors.text,
  },
  commodityStock: {
    color: colors.textMuted,
  },
  price: {
    color: colors.accent,
  },
  tradeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tradeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyButton: {
    backgroundColor: colors.success,
  },
  sellButton: {
    backgroundColor: colors.warning,
  },
  tradeButtonText: {
    color: colors.text,
  },
  bankPanel: {
    padding: 20,
  },
  bankStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  bankStat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankStatLabel: {
    marginBottom: 8,
  },
  bankStatValue: {
    color: colors.text,
  },
  bankForm: {
    gap: 16,
  },
  bankInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bankButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bankButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  depositButton: {
    backgroundColor: colors.primary,
  },
  withdrawButton: {
    backgroundColor: colors.secondary,
  },
  bankButtonText: {
    color: colors.text,
  },
  shipyardPanel: {
    padding: 20,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  comingSoonTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
  },
  comingSoonText: {
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ActionsScreen;