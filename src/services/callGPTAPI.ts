// callGPTAPI.ts
// import { OPENAI_API_KEY } from '@env';
import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";

interface CallableResponse {
    message: string;
  }
export const callGPTAPI = async (inputText: string, promptContent:string, gptModel:string, patientId:string, userId:string) => {
    try {
        const callGPTFunction = httpsCallable(functions, "callGPTAPI");
        const result = await callGPTFunction({ inputText, promptContent, gptModel});
        const data = result.data as CallableResponse; 
        if (data.message) {
            return data.message;
        }
        } catch (error) {
        console.error(`Failed to fetch from the cloud function: ${error}`);
    }
    // The following is call GPT API directly
    // try {
    //     //   const prompt = `
    //     //   The following is the summary of the present illness. 
    //     //   As you are a doctor helper, please transform the following text to the professional medical note.
    //     //   Text: `;
    //     const content = {
    //         "model": "gpt-4",
    //         "messages": [
    //             { "role": "system", "content": "You are a helpful assistant." },
    //             { "role": "user", "content": promptContent + ' ' + inputText }
    //         ],
    //         "temperature": 0.5
    //     };
    //     const headers = {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${OPENAI_API_KEY}`
    //     };
    //     try {
    //         const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //             method: 'POST',
    //             headers,
    //             body: JSON.stringify(content)
    //         });
    //         const data = await response.json();
    //         return data['choices'][0]['message']['content'].trim();
    //     } catch (error) {
    //         console.error('Failed to call GPT API')
    //     }
    // } catch (error) {
    //     console.error('Failed to fetch preferences:', error);
    //     // Handle the error, possibly by informing the user about it
    // }
};
