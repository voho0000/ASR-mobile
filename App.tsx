import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { PaperProvider, DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6B3FA0',  // specify your color
    background: '#ffffff',
    text: '#000000',
    // Add other color definitions as needed
  },
};

const App = () => {
  return (
    <>
      <PaperProvider theme={theme}>
        <AppNavigator />
        <Toast />
      </PaperProvider>
    </>
  );
};

export default App;
