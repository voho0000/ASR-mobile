// AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PreferenceScreen from '../screens/PreferenceScreen';
import PromptListScreen from '../screens/PromptListScreen';
import PromptDetailScreen from '../screens/PromptDetailScreen';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export type HomeTabParams = {
  HomeScreen: undefined;
  SettingsScreen: undefined;
};

export type RootStackParamList = {
  HomeTabs: undefined;
  HomeScreen: undefined;
  RecordingScreen: { name: string };
  LoginScreen: undefined;
  SignupScreen: undefined;
  ProfileScreen: undefined;
  PreferenceScreen: undefined;
  SettingsScreen: undefined;
  PromptListScreen: undefined;
  PromptDetailScreen: { name?: string, isNew: boolean };
};


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{  headerShown: false }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{  headerShown: false }} />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        setIsLogged(true);
      } else {
        setIsLogged(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
        }}
        initialRouteName={isLogged ? 'HomeTabs' : 'LoginScreen'}
      >
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ title: '' }} 
        />
        <Stack.Screen name="RecordingScreen" component={RecordingScreen} options={{ title: 'Detail' }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Log In' }} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ title: 'Sign Up' }} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="PreferenceScreen" component={PreferenceScreen} options={{ title: 'Preference' }} />
        <Stack.Screen name="PromptListScreen" component={PromptListScreen} options={{ title: 'Prompts' }} />
        <Stack.Screen name="PromptDetailScreen" component={PromptDetailScreen} options={{ title: 'Prompt Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;