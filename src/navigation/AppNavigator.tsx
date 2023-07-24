import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';


export type RootStackParamList = {
  HomeScreen: undefined;
  RecordingScreen: { name: string };
  LoginScreen: undefined;
  SignupScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
  
    useEffect(() => {
        // Check if the user is logged in
        AsyncStorage.getItem('userToken').then(token => {
          setUserToken(token);
          setIsLoading(false); // set isLoading to false after the token has been retrieved
        });
      }, []);
    
      if (isLoading) {
        return null; // or a loading indicator if you prefer
      }
  
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={userToken ? 'HomeScreen' : 'LoginScreen'}>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="RecordingScreen" component={RecordingScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignupScreen" component={SignupScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

// const AppNavigator = () => {
//     return (
//         <NavigationContainer>
//             <Stack.Navigator initialRouteName="HomeScreen">
//                 <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'Home' }} />
//                 <Stack.Screen name="RecordingScreen" component={RecordingScreen} options={{ title: 'Recording' }} />
//             </Stack.Navigator>
//         </NavigationContainer>
//     );
// };

export default AppNavigator;
