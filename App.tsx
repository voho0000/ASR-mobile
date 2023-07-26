import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { PaperProvider } from 'react-native-paper';

const App = () => {
  return (
    <>
      <PaperProvider>
        <AppNavigator />
        <Toast />
      </PaperProvider>
    </>
  );
};

export default App;
