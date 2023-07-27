// FirestoreService.ts
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';

export const fetchPatientRecords = async (): Promise<string[]> => {

  const userId = auth.currentUser?.uid

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }
  else {
    const patientRecordsRef = collection(db, 'PatientRecords', userId, 'PatientRecord');
    const patientRecordsSnap = await getDocs(patientRecordsRef);

    return patientRecordsSnap.docs.map(doc => doc.id);
  }
};

export const addPatientRecord = async (patientId: string): Promise<void> => {
  const userId = auth.currentUser?.uid

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  await setDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId), {
    asrResponse: "",
    gptResponse: "",
    patientInfo: ""
  });
};


export const uploadDataToFirestore = async (
  patientId: string,
  patientInfo: string,
  asrResponse: string,
  gptResponse: string
) => {
  const userId = auth.currentUser?.uid

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  await updateDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId), {
    patientInfo,
    asrResponse,
    gptResponse,
  });
};

export const fetchSinglePatientRecord = async (
  patientId: string
): Promise<any> => {
  const userId = auth.currentUser?.uid

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  const docSnap = await getDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId));

  if (!docSnap.exists()) {
    throw new Error(`Failed to fetch patient record: ${patientId}`);
  }

  return docSnap.data();
};

export const deletePatientRecord = async (
  patientId: string
): Promise<void> => {
  const userId = auth.currentUser?.uid

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  await deleteDoc(doc(db, 'PatientRecords', userId, 'PatientRecord', patientId));
};

export const initializePreferences = async (): Promise<void> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  await setDoc(doc(db, 'Preferences', userId), {
    commonWords: `病史, 主訴, 家族史, 過敏`,
    gptPrompt: `The following is the summary of the present illness. As you are a doctor helper, please transform the following text to the professional medical note. Text: `
  });
};

export const updateCommonWords = async (commonWords: string): Promise<void> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  await updateDoc(doc(db, 'Preferences', userId), {
    commonWords,
  });
};

export const updateGptPrompt = async (gptPrompt: string): Promise<void> => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  await updateDoc(doc(db, 'Preferences', userId), {
    gptPrompt,
  });
};

export const fetchPreferences = async () => {
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated, please log in again');
  }

  const docSnap = await getDoc(doc(db, 'Preferences', userId));

  if (!docSnap.exists()) {
    throw new Error(`Failed to fetch preferences for user: ${userId}`);
  }

  return docSnap.data();
};