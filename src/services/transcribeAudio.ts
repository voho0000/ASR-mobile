// export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
//     const OPENAI_API_KEY = "";
    
//     const data = new FormData();
//     data.append('file', audioBlob, 'audio.mp3');  // 將 Blob 作為文件附加到 FormData
//     data.append('model', 'whisper-1');
//     data.append('prompt', 'The following is about a medical summary of a patient. Answer in Traditional Chinese and English.');
//     try {
//       const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
//         method: 'POST',
//         body: data,
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           // 請注意，我們不需要在這裡設置 `Content-Type`，瀏覽器會自動設置 `multipart/form-data` 邊界
//         },
//       });
//       const jsonResponse = await response.json();
//       console.log(jsonResponse);
//       return jsonResponse['text'];
//     } catch (error) {
//       console.error('Error during transcription:', error);
//       throw new Error('Error occurred while transcribing');
//     }
//   };


import { fetchPreferences } from './FirestoreService';
import * as OpenCC from 'opencc-js';

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
        data.append('file', audioInput, 'recording.mp3');
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
        if (jsonResponse) {
            return converter(jsonResponse['transcript']);// 返回轉錄的文本
        } else {
            console.error('Failed to transcribe audio:', jsonResponse);
            throw new Error('Failed to transcribe audio');
        }
    } catch (error) {
        console.error('Error during transcription:', error);
        throw new Error('Error occurred while transcribing');
    }
};