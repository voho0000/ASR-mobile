// transcribeAudio.ts
import { OPENAI_API_KEY } from '@env';
import { Platform } from 'react-native';


export const transcribeAudio = async (audioUri: string) => {
    const data = new FormData();

    if (Platform.OS === 'web') {
      const response = await fetch(audioUri);
      const blob = await response.blob();
      const file = new File([blob], 'recording.m4a', { type: 'audio/m4a' });
      data.append('file', file);
    } else {
      const file = { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' };
      data.append('file', file as unknown as Blob);
    }
  
    data.append('model', 'whisper-1');
    //   data.append('prompt', 'The following is about medical summary of a patient. Answer in traditional chinese and english')

    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            body: data,
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
        });
        const jsonResponse = await response.json();
        if (jsonResponse) {
            return jsonResponse['text']; // Assuming 'transcript' is a field in the response
        } else {
            console.error('Failed to transcribe audio:', jsonResponse);
            throw new Error('Failed to transcribe audio');
        }
    } catch (error) {
        console.error('Error during transcription:', error);
        throw new Error('Error occurred while transcribing');
    }
};
