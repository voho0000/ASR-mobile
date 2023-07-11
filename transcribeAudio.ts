// transcribeAudio.ts
import { OPENAI_API_KEY } from '@env';

export const transcribeAudio = async (audioUri: string) => {
  const file = await fetch(audioUri);
  const blob = await file.blob();

  const data = new FormData();
  console.log(file);
  data.append('file', blob, `audio.${blob.type.split('/')[1]}`); // Assuming .mp3 format
  data.append('model', 'whisper-1');
  data.append('prompt', 'The following is about medical summary of a patient. Answer in traditional chinese and english')

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
