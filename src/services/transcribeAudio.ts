// transcribeAudio.ts
// import { OPENAI_API_KEY } from '@env';
import { Platform } from 'react-native';
import { fetchPreferences } from './FirestoreService';

export const transcribeAudio = async (audioUri: string) => {
    const data = new FormData();
    try {
        const preferences = await fetchPreferences();
        if (preferences.commonWords) {
            data.append('prompt', preferences.commonWords)
        }
    } catch (error) {
        console.error('Failed to fetch preferences:', error);
        // Handle the error, possibly by informing the user about it
    }
    if (Platform.OS === 'web') {
        const response = await fetch(audioUri);
        const blob = await response.blob();
        const file = new File([blob], 'recording.m4a', { type: 'audio/m4a' });
        data.append('file', file);
    } else {
        const file = { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' };
        data.append('file', file as unknown as Blob);
    }

    try {
        const response = await fetch('https://us-central1-gpt-medical-note.cloudfunctions.net/uploadFile', {
            method: 'POST',
            body: data,
            headers: {
            },
        });
        const jsonResponse = await response.json(); // <-- add await here
        if (jsonResponse) {
            return jsonResponse['transcript']; // Assuming 'transcript' is a field in the response
        } else {
            console.error('Failed to transcribe audio:', jsonResponse);
            throw new Error('Failed to transcribe audio');
        }
                // const jsonResponse = await response.json();
        // if (jsonResponse) {
        //     return jsonResponse['text']; // Assuming 'transcript' is a field in the response
        // } else {
        //     console.error('Failed to transcribe audio:', jsonResponse);
        //     throw new Error('Failed to transcribe audio');
        // }
    } catch (error) {
        console.error('Error during transcription:', error);
        throw new Error('Error occurred while transcribing');
    }

    // try {
    //     data.append('model', 'whisper-1');
    //     const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //         method: 'POST',
    //         body: data,
    //         headers: {
    //             'Authorization': `Bearer ${OPENAI_API_KEY}`,
    //         },
    //     });
    //     const jsonResponse = await response.json();
    //     if (jsonResponse) {
    //         return jsonResponse['text']; // Assuming 'transcript' is a field in the response
    //     } else {
    //         console.error('Failed to transcribe audio:', jsonResponse);
    //         throw new Error('Failed to transcribe audio');
    //     }
    // } catch (error) {
    //     console.error('Error during transcription:', error);
    //     throw new Error('Error occurred while transcribing');
    // }
};
