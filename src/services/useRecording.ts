import { useState, useEffect, useRef } from "react";
import { startWebRecording } from './webRecording';
import { transcribeAudio } from './transcribeAudio';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
export const useRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const webRecording = useRef<Awaited<ReturnType<typeof startWebRecording>> | null>(null);
  const mounted = useRef(true);
  const starting = useRef(false);
  const activeRecording = useRef(false);
  const nativeRecording = useRef<Audio.Recording | null>(null);
  const lastBlobURL = useRef<string | null>(null);
  const [blobURL, setBlobURL] = useState<string | null>(null);

  useEffect(() => () => {
    if (lastBlobURL.current) URL.revokeObjectURL(lastBlobURL.current);
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeRecording.current = false;
      webRecording.current?.cancel();
      void nativeRecording.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

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

  // 開始錄音
  const startRecording = async () => {
    if (starting.current || activeRecording.current) return;
    starting.current = true;
    try {
      if (Platform.OS === 'web') {
        const capture = await startWebRecording();
        if (!mounted.current) {
          capture.cancel();
          return;
        }
        webRecording.current = capture;
      } else {
        // 在 iOS/Android 應用中，使用 Expo 的錄音 API
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
  
          nativeRecording.current = newRecording;
          setRecording(newRecording);
          setIsRecording(true);
        }
      }
      activeRecording.current = true;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      showToast('Failed to start recording.', 'error');
    } finally {
      starting.current = false;
    }
  };

// 停止錄音
const stopRecording = async (shouldShowToast: boolean = true) => {
  if (!activeRecording.current) return;
  activeRecording.current = false;
  setIsRecording(false);
  setIsPaused(false);
  setCounter(0);
  if (Platform.OS === 'web') {
    try {
      const capture = webRecording.current;
      webRecording.current = null;
      if (!capture) return;
      const blob = await capture.stop();
      if (!mounted.current) return;
      const blobURL = URL.createObjectURL(blob);
      if (lastBlobURL.current) URL.revokeObjectURL(lastBlobURL.current);
      lastBlobURL.current = blobURL;
      setBlobURL(blobURL);
      setIsRecording(false);
      setIsPaused(false);
      setCounter(0);

      // 傳送錄音 Blob
      if (blob) {
        try {
          const transcript = await transcribeAudio(blob); // 傳遞 Blob
          if (shouldShowToast) {
            showToast('Successfully transcribed audio', 'success');
          }          return transcript;
        } catch (error) {
          console.error('Failed to transcribe audio:', error);
          if (shouldShowToast) {
            showToast(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.');
          }        }
      }
    } catch (error) {
      console.error('Failed to stop web recording:', error);
      if (shouldShowToast) {
        showToast('Failed to stop recording. Please try again.');
      }    }
  } else {
    try {
      await recording?.stopAndUnloadAsync();
      const audioUri = recording?.getURI() || null;
      nativeRecording.current = null;
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setCounter(0);

      if (audioUri) {
        try {
          const transcript = await transcribeAudio(audioUri); // 傳遞 URI
          if (shouldShowToast) {
            showToast('Successfully transcribed audio', 'success');
          }          
          return transcript;
        } catch (error) {
          console.error('Failed to transcribe audio:', error);
          if (shouldShowToast) {
            showToast(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.');
          }        
        }
      }
    } catch (error) {
      console.error('Failed to stop app recording:', error);
      if (shouldShowToast) {
        showToast('Failed to stop recording. Please try again.');
      }    }
  }
};

  // 通用的 toast 顯示
  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    Toast.show({
      type,
      position: 'top',
      text1: type === 'success' ? 'Success' : 'Error',
      text2: message,
      visibilityTime: 2000,
      autoHide: true,
      bottomOffset: 40,
    });
  };

  return {
    isRecording,
    isPaused,
    counter,
    startRecording,
    stopRecording,
    // pauseRecording,
    blobURL,
  };
};