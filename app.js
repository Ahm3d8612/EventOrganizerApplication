// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DashboardScreen from './screens/DashboardScreen'; // will create later
import LoginScreen from './screens/LoginScreen'; // we will create this next
import SignUpScreen from './screens/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
