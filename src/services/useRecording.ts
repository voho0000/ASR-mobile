// useRecording.ts
import { useState, useEffect } from "react";
import { Audio } from 'expo-av';
import { transcribeAudio } from './transcribeAudio';
import Toast from 'react-native-toast-message';

export const useRecording = (setText: React.Dispatch<React.SetStateAction<string>>) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);

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

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      if (isPaused) {
        await recording?.startAsync();
        setIsPaused(false);
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: true
        });
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        await newRecording.startAsync();

        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Failed to start recording. Please try again.',
        visibilityTime: 2000,
        autoHide: true,
        bottomOffset: 40,
      });    }
  };

  const pauseRecording = async () => {
    try {
      await recording?.pauseAsync();
      setIsPaused(true);
    } catch (error) {
      console.error('Failed to pause recording:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Failed to pause recording. Please try again.',
        visibilityTime: 2000,
        autoHide: true,
        bottomOffset: 40,
      });    }
  };

  const stopRecording = async () => {
    try {
      await recording?.stopAndUnloadAsync();
      const audioUri = recording?.getURI() || null;
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setCounter(0);
      if (audioUri) {
        try {
          const transcript = await transcribeAudio(audioUri);
          setText(transcript);
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Success',
            text2: 'Successfully transcribed audio',
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 40,
          });
        } catch (error) {
          console.error('Failed to pause recording:', error);
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Error',
            text2: 'Failed to transcribe audio. Please try again.',
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 40,
          });        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Failed to stop recording. Please try again.',
        visibilityTime: 2000,
        autoHide: true,
        bottomOffset: 40,
      });    }
  };

  return {
    recording,
    isRecording,
    isPaused,
    counter,
    startRecording,
    stopRecording,
    pauseRecording,
  };
};
