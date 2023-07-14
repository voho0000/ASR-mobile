import { useState, } from 'react';
import { StyleSheet, TextInput, View, Text, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Button, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { callGPTAPI } from './callGPTAPI';
import IconButton from './IconButton';
import { useRecording } from './useRecording';

const App = () => {
  const [text, setText] = useState<string>("");
  const [gptResponse, setGptResponse] = useState<string>(""); // Stores the GPT response
  const [isLoading, setIsLoading] = useState<boolean>(false); // Handles loading state

  const {
    recording,
    isRecording,
    isPaused,
    counter,
    startRecording,
    stopRecording,
    pauseRecording,
  } = useRecording(setText);

  const sendToGPT = async () => {
    setIsLoading(true);
    try {
      const response = await callGPTAPI(text);
      setGptResponse(response);
    } catch (error) {
      console.error("Failed to get response from GPT:", error);
      Alert.alert("Error", "Failed to get response from GPT. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardContainer}>
        <View style={styles.container}>
          <Text>Recording Time: {counter} seconds</Text>
          <View style={styles.buttonsContainer}>
            {isRecording ? (
              <>
                <IconButton
                  onPress={isPaused ? startRecording : pauseRecording}
                  iconName={isPaused ? "play" : "pause"}
                  buttonStyle={styles.recordButton}
                  iconStyle={styles.icon}
                />
                <IconButton
                  onPress={stopRecording}
                  iconName="stop"
                  buttonStyle={styles.recordButton}
                  iconStyle={styles.icon}
                />
              </>
            ) : (
              <IconButton
                onPress={startRecording}
                iconName="microphone"
                buttonStyle={styles.recordButton}
                iconStyle={styles.icon}
              />
            )}
          </View>
          <TextInput
            multiline
            style={styles.textInput}
            onChangeText={setText}
            value={text}
          />
          {/* <Button title="Send to GPT" onPress={sendToGPT} disabled={isLoading} /> */}
          <TouchableOpacity
            onPress={sendToGPT}
            style={[styles.button, isLoading ? styles.disabledButton : null]}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Send to GPT</Text>
          </TouchableOpacity>
          <TextInput
            multiline
            style={styles.textInput}
            value={gptResponse}
            onChangeText={setGptResponse}
          />
          <StatusBar style="auto" />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: 'gray', // or another color of your choice
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  recordButton: {
    backgroundColor: 'red',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  icon: {
    color: 'white',
  },
});

export default App;
