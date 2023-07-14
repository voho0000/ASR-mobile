// useRecording.ts

import { useState, useEffect } from "react";
import { Audio } from 'expo-av';
import { Alert } from 'react-native';
import { transcribeAudio } from './transcribeAudio';

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

  const showToast = (message: string) => {
    Alert.alert("Notification", message);
  };

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
      showToast("Failed to start recording. Please try again.");
    }
  };

  const pauseRecording = async () => {
    try {
      await recording?.pauseAsync();
      setIsPaused(true);
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
