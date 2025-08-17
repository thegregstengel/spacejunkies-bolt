import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AuthScreen from '../screens/AuthScreen';
import GalaxyHubScreen from '../screens/GalaxyHubScreen';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={AuthScreen} />
      <Stack.Screen name="GalaxyHub" component={GalaxyHubScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;