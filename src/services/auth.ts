import { auth } from '../firebaseConfig'; // Import your Firebase auth instance
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import Toast from 'react-native-toast-message';

const handleFirebaseError = (error: any) => {
  if (error.code === "auth/too-many-requests") {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: 'Too many requests. Please try again later.',
      visibilityTime: 2000,
      autoHide: true,
    });
  }
  else if (error.code === "auth/network-request-failed") {
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Error',
      text2: 'Network error. Please try again later.',
      visibilityTime: 2000,
      autoHide: true,
    });
  } else {

  }
};

export async function createUser(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up 
    const user = userCredential.user;
    if (user) {
      sendEmailVerification(user)
        .then(() => {
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Success',
            text2: 'Verification email has been sent',
            visibilityTime: 2000,
            autoHide: true,
          });
        })
        .catch((error) => {
          console.error('Error sending verification email: ', error);
          // Handle any errors
        });
    }
    return user
  } catch (error) {
    console.error(error);
    if (error instanceof FirebaseError) {
      if (error.code === "auth/email-already-in-use") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Email already in use',
          visibilityTime: 2000,
          autoHide: true,
        })
      }
      else if (error.code === "auth/invalid-email") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Invalid email',
          visibilityTime: 2000,
          autoHide: true,
        })
      }
      else {
        handleFirebaseError(error)
      }
    }
  }
}

export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Signed in 
    const user = userCredential.user;
    // Check if email is verified
    if (!user.emailVerified) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Please verify your email before logging in.',
        visibilityTime: 2000,
        autoHide: true,
      });
      return null;
    }

    return user
  } catch (error) {
    console.error(error);
    if (error instanceof FirebaseError) { // type guard
      console.error(error.message);
      if (error.code === "auth/user-not-found") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'User does not exist.',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
      else if (error.code === "auth/wrong-password") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Wrong password.',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
      else if (error.code === "auth/invalid-email") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Invalid email.',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
      else if (error.code === "auth/too-many-requests") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Too many requests. Please try again later.',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
      else if (error.code === "auth/network-request-failed") {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Error',
          text2: 'Network error. Please try again later.',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    }
  }
}


export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out: ", error);
    return false;
  }
};


export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Success',
      text2: 'Password reset email has been sent',
      visibilityTime: 2000,
      autoHide: true,
    });
  } catch (error: any) {
    if (error instanceof FirebaseError) {
      console.error(error.message);
      switch (error.code) {
        case 'auth/invalid-email':
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Error',
            text2: 'Invalid email.',
            visibilityTime: 2000,
            autoHide: true,
          });
          break;
        case 'auth/user-not-found':
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Error',
            text2: 'No user corresponding to this email.',
            visibilityTime: 2000,
            autoHide: true,
          });
          break;
        default:
          Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Error',
            text2: 'Error sending password reset email.',
            visibilityTime: 2000,
            autoHide: true,
          });
          break;
      }
    }
  }
}
