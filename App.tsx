import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, TextInput, View, Text, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import { transcribeAudio } from './transcribeAudio';
import { callGPTAPI } from './callGPTAPI';

const App = () => {
  const [text, setText] = useState<string>("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [gptResponse, setGptResponse] = useState<string>(""); // Stores the GPT response
  const [isLoading, setIsLoading] = useState<boolean>(false); // Handles loading state


  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setCounter(prevCounter => prevCounter + 1);
      }, 1000);
    } else {
      clearInterval(interval!);
    }
    return () => clearInterval(interval!);
  }, [isRecording, isPaused]);

  const showToast = (message: string) => {
    Alert.alert("Notification", message);
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast("Permission to access audio recording was denied.");
        return;
      }

      if (isPaused) {
        await recording?.startAsync();
        setIsPaused(false);
        showToast("Recording resumed.");
      } else {
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await newRecording.startAsync();

        setRecording(newRecording);
        setIsRecording(true);
        showToast("Recording started.");
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      showToast("Failed to start recording. Please try again.");
    }
  };

  const pauseRecording = async () => {
    try {
      await recording?.pauseAsync();
      setIsPaused(true);
      showToast("Recording paused.");
    } catch (error) {
      console.error('Failed to pause recording:', error);
      showToast("Failed to pause recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const audioUri = recording?.getURI() || null;
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setCounter(0);
      showToast("Recording stopped.");

      if (audioUri) {
        try {
          const transcript = await transcribeAudio(audioUri);
          setText(transcript);
        } catch (error) {
          console.error('Failed to pause recording:', error);
          showToast("Failed to transcribe. Please try again.");
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      showToast("Failed to stop recording. Please try again.");
    }
  };

  const sendToGPT = async () => {
    setIsLoading(true);
    try {
      // Call your GPT API here with the `text` as the input.
      // Assuming you have a function named callGPTAPI that does this:
      const response = await callGPTAPI(text);
      setGptResponse(response);
    } catch (error) {
      console.error("Failed to get response from GPT:", error);
      Alert.alert("Error", "Failed to get response from GPT. Please try again.");
    }
    setIsLoading(false);
  };


  return (
    <View style={styles.container}>
      <Text>Recording Time: {counter} seconds</Text>
      <Button title={isRecording ? (isPaused ? "Resume Recording" : "Pause Recording") : "Start Recording"} onPress={isRecording ? (isPaused ? startRecording : pauseRecording) : startRecording} />
      <Button title="Stop Recording" onPress={stopRecording} disabled={!isRecording} />
      <TextInput
        multiline
        style={styles.textInput}
        onChangeText={setText}
        value={text}
      />
      <Button title="Send to GPT" onPress={sendToGPT} disabled={isLoading} />
      <TextInput
        multiline
        style={styles.textInput}
        value={gptResponse}
        onChangeText={setGptResponse}
      />
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
