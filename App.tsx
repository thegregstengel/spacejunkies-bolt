import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { GameProvider } from './src/context/GameContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { GameProvider } from './src/context/GameContext';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/colors';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <GameProvider>
            <NavigationContainer theme={theme}>
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </GameProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
            <NavigationContainer theme={theme}>
              <AppNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </GameProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});