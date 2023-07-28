// FirestoreService.ts
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';
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



export const fetchPatientRecords = async (): Promise<string[]> => {

  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    const patientRecordsRef = collection(db, 'PatientRecords', userId, 'PatientRecord');
    const patientRecordsSnap = await getDocs(patientRecordsRef);

    return patientRecordsSnap.docs.map(doc => doc.id);
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

    await updateDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId), {
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
      commonWords: ``,
      gptPrompt: `The following is the summary of the present illness. As you are a doctor helper, please transform the following text to the professional medical note. Text: `
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const updateCommonWords = async (commonWords: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await updateDoc(doc(db, 'Preferences', userId), {
      commonWords,
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

export const updateGptPrompt = async (gptPrompt: string): Promise<void> => {
  try {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      throw new Error('User not authenticated, please log in again');
    }

    await updateDoc(doc(db, 'Preferences', userId), {
      gptPrompt,
    });
  } catch (error) {
    handleFirestoreError(error as FirebaseError);
    throw error; // re-throw the error after handling it
  }
};

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
  birthday: Date,
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


export const updateUserInfo = async (sex: string, birthday: Date, position: string): Promise<void> => {
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