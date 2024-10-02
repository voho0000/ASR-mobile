import { useState, useEffect } from "react";
// @ts-ignore
import Mp3Recorder from 'mic-recorder-to-mp3';  // 引入 mic-recorder-to-mp3
import { transcribeAudio } from './transcribeAudio';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
export const useRecording = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [counter, setCounter] = useState<number>(0);
  const [mp3Recorder] = useState(new Mp3Recorder({ bitRate: 128 }));
  const [blobURL, setBlobURL] = useState<string | null>(null);

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
    try {
      if (Platform.OS === 'web') {
        // 如果是在 Web 上，使用 mic-recorder-to-mp3
        await mp3Recorder.start();
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
  
          setRecording(newRecording);
          setIsRecording(true);
        }
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      showToast('Failed to start recording.', 'error');
    }
  };

  // // 暫停錄音
  // const pauseRecording = async () => {
  //   if (Platform.OS === 'web') {
  //     try {
  //       await mp3Recorder.pause();
  //       setIsPaused(true);
  //     } catch (error) {
  //       console.error('Failed to pause web recording:', error);
  //       showToast('Failed to pause recording. Please try again.', 'error');
  //     }
  //   } else {
  //     try {
  //       await recording?.pauseAsync();
  //       setIsPaused(true);
  //     } catch (error) {
  //       console.error('Failed to pause app recording:', error);
  //       Toast.show({
  //         type: 'error',
  //         position: 'top',
  //         text1: 'Error',
  //         text2: 'Failed to pause recording. Please try again',
  //         visibilityTime: 2000,
  //         autoHide: true,
  //         bottomOffset: 40,
  //       });      }
  //   }
  // };


// 停止錄音
const stopRecording = async (shouldShowToast: boolean = true) => {
  if (Platform.OS === 'web') {
    try {
      const [buffer, blob] = await mp3Recorder.stop().getMp3();
      const blobURL = URL.createObjectURL(blob);
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
            showToast('Failed to transcribe audio. Please try again.');
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
            showToast('Failed to transcribe audio. Please try again.');
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