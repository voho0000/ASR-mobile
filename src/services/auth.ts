import { FIREBASE_API_KEY } from '@env';

interface AuthResponse {
  idToken?: string;
  localId?: string;
  error?: {
    message: string;
  };
}

async function authenticate(mode: 'signUp' | 'signInWithPassword', email: string, password: string): Promise<AuthResponse> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:${mode}?key=${FIREBASE_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
      returnSecureToken: true,
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.log(data.error.message);
    throw new Error(data.error.message);
  }

  return { idToken: data.idToken, localId: data.localId };
}

export async function createUser(email: string, password: string) {
    const authData = await authenticate('signUp', email, password);
    console.log(authData.localId);
    if (!authData.idToken) {
      throw new Error('Authentication failed');
    }
  
    const url = `https://firestore.googleapis.com/v1/projects/gpt-medical-note/databases/(default)/documents/Users?documentId=${authData.localId}`;
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         'Authorization': `Bearer ${authData.idToken}`,
      },
      body: JSON.stringify({
        fields: {
            email: {
                stringValue: email,
            }
        },
      }),
    });
  
    const data = await response.json();
    console.log(data);
  
    if (!response.ok) {
      throw new Error(data.error?.message);
    }
  
    return authData;
  }
  

export function login(email: string, password: string) {
  return authenticate('signInWithPassword', email, password);
}
