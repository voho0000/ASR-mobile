// transcribeAudio.ts
import { OPENAI_API_KEY } from '@env';

export const transcribeAudio = async (audioUri: string) => {
    const file = { uri: audioUri, name: 'recording.m4a', type: 'audio/m4a' };
    const data = new FormData();
    data.append('model', 'whisper-1');
    data.append('file', file as unknown as Blob);
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
