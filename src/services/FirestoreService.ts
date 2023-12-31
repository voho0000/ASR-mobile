// FirestoreService.ts
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import Toast from 'react-native-toast-message';
import { FirebaseError } from 'firebase/app';

const handleFirestoreError = (error: any) => {
  if (error.code === "not-found") {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: 'Document not found.',
      visibilityTime: 2000,
      autoHide: true,
    });
  }
  else if (error.code === "permission-denied") {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: 'Permission denied.',
      visibilityTime: 2000,
      autoHide: true,
    });
  }
  else if (error.code === "aborted") {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: 'Operation aborted.',
      visibilityTime: 2000,
      autoHide: true,
    });
  }
  else if (error.code === "unavailable") {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: 'Network error. Please check your internet connection.',
      visibilityTime: 2000,
      autoHide: true,
    });
  }
  // Add more error types if needed
  else {
    // Handle any other types of errors
  }
};



export const fetchPatientRecords = async (): Promise<{id: string, info: string}[]> => {

  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const patientRecordsRef = collection(db, 'PatientRecords', userId, 'PatientRecord');
    const patientRecordsSnap = await getDocs(patientRecordsRef);

    // return patientRecordsSnap.docs.map(doc => doc.id);
    return patientRecordsSnap.docs.map(doc => ({id: doc.id, info: doc.data().patientInfo}));

  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const addPatientRecord = async (patientId: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await setDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId), {
      asrResponse: "",
      gptResponse: "",
      patientInfo: ""
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};


export const uploadDataToFirestore = async (
  patientId: string,
  patientInfo: string,
  asrResponse: string,
  gptResponse: string
) => {
  try {
    const userId = auth.currentUser?.uid

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    // add or update record
    await setDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId), {
      patientInfo,
      asrResponse,
      gptResponse,
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const fetchSinglePatientRecord = async (
  patientId: string
): Promise<any> => {
  try {
    const userId = auth.currentUser?.uid

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const docSnap = await getDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId));

    if (!docSnap.exists()) {
      throw new Error(`Failed to fetch patient record: ${patientId}`);
    }

    return docSnap.data();
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const deletePatientRecord = async (
  patientId: string
): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await deleteDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId));
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const initializePreferences = async (): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await setDoc(doc(db, 'Preferences', userId), {
      commonWords: "",
      gptModel: "gpt-3.5-turbo",
      defaultPrompt: ""
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const updatePreference = async (commonWords: string, gptModel:string, defaultPrompt:string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await updateDoc(doc(db, 'Preferences', userId), {
      commonWords,
      gptModel,
      defaultPrompt
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

// export const updateGptPrompt = async (gptPrompt: string): Promise<void> => {
//   try {
//     const userId = auth.currentUser?.uid;

//     if (!userId) {
//       throw new Error('User not authenticated, please log in again');
//     }

//     await updateDoc(doc(db, 'Preferences', userId), {
//       gptPrompt,
//     });
//   } catch (error) {
//     handleFirestoreError(error as FirebaseError);
//     throw error; // re-throw the error after handling it
//   }
// };

export const fetchPreferences = async () => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const docSnap = await getDoc(doc(db, 'Preferences', userId));

    if (!docSnap.exists()) {
      throw new Error(`Failed to fetch preferences for user: ${userId}`);
    }

    return docSnap.data();
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const createUserInfo = async (
  userId: string,
  email: string,
  sex: string,
  birthday: string,
  position: string
): Promise<void> => {
  try {
    const createTime = new Date();

    await setDoc(doc(db, 'Users', userId), {
      email,
      sex,
      birthday,
      position,
      createTime
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const fetchUserInfo = async (): Promise<any> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const docSnap = await getDoc(doc(db, 'Users', userId));

    if (!docSnap.exists()) {
      throw new Error(`Failed to fetch user info for user: ${userId}`);
    }

    return docSnap.data();
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};


export const updateUserInfo = async (sex: string, birthday: string, position: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await updateDoc(doc(db, 'Users', userId), {
      sex,
      birthday,
      position,
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const fetchPrompts = async (): Promise<any[]> => {
  try {
    const userId =auth.currentUser ?.uid;
    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const promptsRef = collection(db, 'Prompts', userId, 'prompt');
    const promptsSnap = await getDocs(promptsRef);

    return promptsSnap.docs.map(doc => ({ name: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error;
  }
};

export const fetchSinglePrompt = async (promptName: string): Promise<any> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const docSnap = await getDoc(doc(db, 'Prompts', userId, 'prompt', promptName));

    if (!docSnap.exists()) {
      throw new Error(`Failed to fetch prompt: ${promptName}`);
    }

    return { name: docSnap.id, ...docSnap.data() };
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error;
  }
};


export const addPrompt = async (promptName: string, promptContent: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await setDoc(doc(db, 'Prompts', userId, 'prompt', promptName), {
      promptContent,
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error;
  }
};

export const updatePrompt = async (oldPromptName: string, newPromptName: string, promptContent: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    if (oldPromptName !== newPromptName) {
      // delete old prompt
      await deleteDoc(doc(db, 'Prompts', userId, 'prompt', oldPromptName));
    }

    // add or update new prompt
    await setDoc(doc(db, 'Prompts', userId, 'prompt', newPromptName), {
      promptContent,
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error;
  }
};

export const deletePrompt = async (promptName: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await deleteDoc(doc(db, 'Prompts', userId, 'prompt', promptName));
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error;
  }
};


export const renamePatientId = async (
  oldPatientId: string,
  newPatientId: string
) => {
  try {
    if (oldPatientId === newPatientId) {
      return;
    }
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    // Fetch existing data for the patient with oldPatientId
    const docRef = doc(db, 'PatientRecords', userId, 'PatientRecord', oldPatientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Data exists for the oldPatientId

      const patientData = docSnap.data();

      if (oldPatientId !== newPatientId) {
        // delete old record
        await deleteDoc(docRef);
      }

      // add or update new record
      await setDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', newPatientId), patientData);
    } else {
      console.error(`No data found for patient with ID: ${oldPatientId}`);
    }
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};
