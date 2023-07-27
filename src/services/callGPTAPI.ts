// callGPTAPI.ts
import { OPENAI_API_KEY } from '@env';

export const callGPTAPI = async (inputText: string) => {
      const prompt = `
      The following is the summary of the present illness. 
      As you are a doctor helper, please transform the following text to the professional medical note.
      Text: `;
    const content = {
        "model": "gpt-4",
        "messages": [
            { "role": "system", "content": "You are a helpful assistant." },
            { "role": "user", "content": prompt + inputText }
        ],
        "temperature": 0.5
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(content)
    });

    const data = await response.json();
    return data['choices'][0]['message']['content'].trim();
};
