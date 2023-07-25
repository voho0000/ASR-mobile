// FirebaseService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchPatientRecords = async (): Promise<string[]> => {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userID');
    if (token === null) {
        throw new Error('User token not found');
    }
    else {
        const url = `https://firestore.googleapis.com/v1/projects/gpt-medical-note/databases/(default)/documents/PatientRecords/${userId}/PatientRecord`;
        const response = await fetch(url, {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch patient records: ${response.status}`);
        }

        const data = await response.json();
        return data.documents.map((doc: any) => doc.name.split('/').pop());
    }
};

export const addPatientRecord = async (patientId: string): Promise<void> => {
    const token = await AsyncStorage.getItem('userToken');
    const userId = await AsyncStorage.getItem('userID');
    if (token === null) {
        throw new Error('User token not found');
    }

    const url = `https://firestore.googleapis.com/v1/projects/gpt-medical-note/databases/(default)/documents/PatientRecords/${userId}/PatientRecord?documentId=${patientId}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            fields: {
                "ASR_response": {
                    "stringValue": "2"
                },
                "GPT_response": {
                    "stringValue": "3"
                },
                "patient_info": {
                    "stringValue": "1"
                }
            }
        }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add patient record: ${errorData.error.message}`);
    }
};


export const uploadDataToFirestore = async (
    patientId: string,
    patientInfo: string,
    asrResponse: string,
    gptResponse: string
  ) => {
    const userId = await AsyncStorage.getItem("userID");
    const token = await AsyncStorage.getItem("userToken");
  
    if (!userId || !token) {
      throw new Error("User is not logged in ");
    }
  
    const apiUrl = `https://firestore.googleapis.com/v1/projects/gpt-medical-note/databases/(default)/documents/PatientRecords/${userId}/PatientRecord/${patientId}`;
  
    const patientRecord = {
      fields: {
        patientInfo: {
          stringValue: patientInfo
        },
        asrResponse: {
          stringValue: asrResponse
        },
        gptResponse: {
          stringValue: gptResponse
        },
      }
    };
  
    const options = {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(patientRecord)
    };
  
    const response = await fetch(apiUrl, options);
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(`Failed to upload data to Firestore: ${data.error?.message || 'Unknown error'}`);
    }
  };
  
  export const fetchSinglePatientRecord = async (
    patientId: string
  ): Promise<any> => {
    const userId = await AsyncStorage.getItem("userID");
    const token = await AsyncStorage.getItem("userToken");
    
    const apiUrl = `https://firestore.googleapis.com/v1/projects/gpt-medical-note/databases/(default)/documents/PatientRecords/${userId}/PatientRecord/${patientId}`;
  
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(
        `Failed to fetch patient record: ${response.status}`
      );
    }
  
    const data = await response.json();
  
    return data;
  };
  
  export const deletePatientRecord = async (
    patientId: string
  ): Promise<void> => {
    const userId = await AsyncStorage.getItem("userID");
    const token = await AsyncStorage.getItem("userToken");
  
    const apiUrl = `https://firestore.googleapis.com/v1/projects/gpt-medical-note/databases/(default)/documents/PatientRecords/${userId}/PatientRecord/${patientId}`;
  
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error(
        `Failed to delete patient record: ${response.status}`
      );
    }
  };
  