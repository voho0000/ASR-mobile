import { fetchPreferences } from './FirestoreService';
import * as OpenCC from 'opencc-js';

class TranscriptionError extends Error {}

// 修改過的 transcribeAudio 函數
export const transcribeAudio = async (audioInput: string | Blob): Promise<string> => {
    const data = new FormData();
    // 初始化繁體中文轉換器
    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' }); // 簡轉繁

    // 添加用戶偏好（如常用詞）到請求中
    try {
        const preferences = await fetchPreferences();
        if (preferences.commonWords) {
            data.append('prompt', preferences.commonWords);
        }
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
    }

    if (audioInput instanceof Blob) {
        // 如果是 Blob（網頁版）
        const extension = audioInput.type.includes('mp4') ? 'm4a' : 'webm';
        data.append('file', audioInput, `recording.${extension}`);
    } else {
        // 如果是 URI（App 版）
        const file = { uri: audioInput, name: 'recording.m4a', type: 'audio/m4a' };
        data.append('file', file as unknown as Blob);
    }


    // 向 Firebase Function 上傳音頻
    try {
        const response = await fetch('https://us-central1-gpt-medical-note.cloudfunctions.net/uploadFile', {
            method: 'POST',
            body: data,
            headers: {
                // 注意：在 FormData 請求中，我們不需要設置 Content-Type，瀏覽器會自動處理
            },
        });
        
        const jsonResponse = await response.json(); // 等待 JSON 響應
        if (response.ok && typeof jsonResponse?.transcript === 'string' && jsonResponse.transcript.trim()) {
            return converter(jsonResponse['transcript']);// 返回轉錄的文本
        } else {
            console.error('Transcription request failed:', response.status);
            throw new TranscriptionError(jsonResponse?.code === 'NO_SPEECH'
                ? 'No speech was recognized. Check the microphone input and try again.'
                : 'Failed to transcribe audio. Please try again.');
        }
    } catch (error) {
        console.error('Audio transcription request failed');
        if (error instanceof TranscriptionError) throw error;
        throw new TranscriptionError('Failed to transcribe audio. Please try again.');
    }
};