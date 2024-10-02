import { useState, useEffect } from "react";
// @ts-ignore
import Mp3Recorder from 'mic-recorder-to-mp3';  // 引入 mic-recorder-to-mp3
import { transcribeAudio } from './transcribeAudio';
import Toast from 'react-native-toast-message';

export const useRecording = () => {
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
      console.log("Starting recording...");
      await mp3Recorder.start();
      setIsRecording(true);
      setIsPaused(false);
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
      });
    }
  };

  // 暫停錄音
  const pauseRecording = async () => {
    try {
      await mp3Recorder.pause();
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
      });
    }
  };


// 停止錄音
const stopRecording = async () => {
  try {
    const [buffer, blob] = await mp3Recorder.stop().getMp3();
    const blobURL = URL.createObjectURL(blob);
    setBlobURL(blobURL);
    setIsRecording(false);
    setIsPaused(false);
    setCounter(0);

    // 轉錄音頻
    if (blob) {
      try {
        const transcript = await transcribeAudio(blob); // 直接傳遞 Blob
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Success',
          text2: 'Successfully transcribed audio',
          visibilityTime: 2000,
          autoHide: true,
          bottomOffset: 40,
        });
        return transcript;
      } catch (error) {
        console.error('Failed to transcribe audio:', error);
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Failed to transcribe audio. Please try again.',
          visibilityTime: 2000,
          autoHide: true,
          bottomOffset: 40,
        });
      }
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
    });
  }
};

  return {
    isRecording,
    isPaused,
    counter,
    startRecording,
    stopRecording,
    pauseRecording,
    blobURL,
  };
};