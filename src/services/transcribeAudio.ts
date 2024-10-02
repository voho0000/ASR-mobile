// transcribeAudio.ts
// import { OPENAI_API_KEY } from '@env';
// import { Platform } from 'react-native';
// import { fetchPreferences } from './FirestoreService';

// export const transcribeAudio = async (audioUri: string) => {
//     const data = new FormData();
//     try {
//         const preferences = await fetchPreferences();
//         if (preferences.commonWords) {
//             data.append('prompt', preferences.commonWords)
//         }
//     } catch (error) {
//         console.error('Failed to fetch preferences:', error);
//         // Handle the error, possibly by informing the user about it
//     }
//     if (Platform.OS === 'web') {
//         const response = await fetch(audioUri);
//         const blob = await response.blob();
//         const file = new File([blob], 'recording.m4a', { type: 'audio/m4a' });
//         data.append('file', file);
//     } else {
//         const file = { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' };
//         data.append('file', file as unknown as Blob);
//     }

//     try {
//         const response = await fetch('https://us-central1-gpt-medical-note.cloudfunctions.net/uploadFile', {
//             method: 'POST',
//             body: data,
//             headers: {
//             },
//         });
//         const jsonResponse = await response.json(); // <-- add await here
//         if (jsonResponse) {
//             return jsonResponse['transcript']; // Assuming 'transcript' is a field in the response
//         } else {
//             console.error('Failed to transcribe audio:', jsonResponse);
//             throw new Error('Failed to transcribe audio');
//         }
//                 // const jsonResponse = await response.json();
//         // if (jsonResponse) {
//         //     return jsonResponse['text']; // Assuming 'transcript' is a field in the response
//         // } else {
//         //     console.error('Failed to transcribe audio:', jsonResponse);
//         //     throw new Error('Failed to transcribe audio');
//         // }
//     } catch (error) {
//         console.error('Error during transcription:', error);
//         throw new Error('Error occurred while transcribing');
//     }

// };

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

// 修改過的 transcribeAudio 函數
export const transcribeAudio = async (audioInput: string | Blob): Promise<string> => {
    const data = new FormData();
    
    // 添加用戶偏好（如常用詞）到請求中
    try {
        const preferences = await fetchPreferences();
        if (preferences.commonWords) {
            data.append('prompt', preferences.commonWords);
        }
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
    }

    // // 檢查是 Web 平台還是其他平台
    // if (Platform.OS === 'web') {
    //     // 直接使用 Blob
    //     data.append('file', audioInput, 'recording.mp3'); // 使用 .mp3 或其他適當格式
    // } else {
    //     // 對於其他平台，假設是 React Native 的情況
    //     const file = { uri: audioInput as unknown as string, name: 'recording.m4a', type: 'audio/m4a' };
    //     data.append('file', file as unknown as Blob); // 強制類型轉換為 Blob
    // }

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
            return jsonResponse['transcript']; // 返回轉錄的文本
        } else {
            console.error('Failed to transcribe audio:', jsonResponse);
            throw new Error('Failed to transcribe audio');
        }
    } catch (error) {
        console.error('Error during transcription:', error);
        throw new Error('Error occurred while transcribing');
    }
};