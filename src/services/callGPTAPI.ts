// callGPTAPI.ts
// import { OPENAI_API_KEY } from '@env';
import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";

interface CallableResponse {
    message: string;
  }
export const callGPTAPI = async (inputText: string, promptContent:string, gptModel:string) => {
    try {
        const callGPTFunction = httpsCallable(functions, "callGPTAPI");
        const result = await callGPTFunction({ inputText, promptContent, gptModel});
        const data = result.data as CallableResponse; 
        if (data.message) {
            return data.message;
        }
        throw new Error("Empty GPT response");
        } catch (error) {
        throw error;
    }
};
