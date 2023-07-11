import React, { useState } from 'react';
import { StyleSheet, Button, TextInput, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';

const App = () => {
  const [text, setText] = useState<string>("");

  const startRecording = () => {
    // Here goes your code for starting the recording
  };

  const sendText = () => {
    // Here goes your code for sending the text to the server
  };

  return (
    <View style={styles.container}>
      <Button title="Start Recording" onPress={startRecording} />
      <TextInput
        multiline
        style={styles.textInput}
        onChangeText={setText}
        value={text}
      />
      <Button title="Send Text" onPress={sendText} />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 200, 
    borderColor: 'gray', 
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    padding: 5
  },
});

export default App;
