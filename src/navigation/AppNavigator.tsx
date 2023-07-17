import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';

export type RootStackParamList = {
  HomeScreen: undefined;
  RecordingScreen: { name: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="HomeScreen">
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
                <Stack.Screen name="RecordingScreen" component={RecordingScreen} options={{ title: 'Recording' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
