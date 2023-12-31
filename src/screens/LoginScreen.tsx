// RecordingScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { login, sendPasswordReset } from '../services/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, TextInput, Text, Snackbar } from 'react-native-paper';

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'LoginScreen'
>;

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false); // state to control Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(''); // state to hold Snackbar message

    const handleLogin = async () => {
        try {
            const user = await login(email.trim(), password);
            if (user) {
                navigation.replace('HomeTabs');
            }
        } catch (error: any) {
            setSnackbarMessage(`Authentication failed: ${error.message}`); // set the Snackbar message
            setSnackbarVisible(true); // show the Snackbar
        }
    };

    const switchToSignup = () => {
        navigation.navigate('SignupScreen');
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setSnackbarMessage('Please enter your email address.'); // set the Snackbar message
            setSnackbarVisible(true); // show the Snackbar
            return;
        }

        try {
            await sendPasswordReset(email);
            // setSnackbarMessage('Password reset link has been sent to your email.'); // set the Snackbar message
            // setSnackbarVisible(true); // show the Snackbar
        } catch (error: any) {
            setSnackbarMessage(`Failed to send password reset email: ${error.message}`); // set the Snackbar message
            setSnackbarVisible(true); // show the Snackbar
        }
    };

    return (
        // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        mode="outlined"
                        label="Email"
                        onChangeText={setEmail}
                        value={email}
                    />
                    <TextInput
                        mode="outlined"
                        label="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry
                        style={{ marginTop: 5 }}
                    />
                    <Button style={{ marginTop: 20, marginBottom: 20 }} mode="contained" onPress={handleLogin}>Log In</Button>
                    <TouchableOpacity onPress={switchToSignup}>
                        <Text
                            onPress={switchToSignup}
                            style={{ textDecorationLine: 'underline', fontSize: 14, textAlign: 'center' }}
                            >
                            Don't have an account? Sign up!
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePasswordReset} style={{ marginTop: 10, marginBottom: 10 }}>
                        <Text
                            style={{ textDecorationLine: 'underline', fontSize: 14, textAlign: 'center' }}
                            >
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                    <Snackbar
                        visible={snackbarVisible}
                        onDismiss={() => setSnackbarVisible(false)}
                        action={{
                            label: 'Close',
                            onPress: () => setSnackbarVisible(false),
                        }}
                    >
                        {snackbarMessage}
                    </Snackbar>
                </View>
            </KeyboardAwareScrollView>
        // </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        width:'100%', 
        maxWidth:1000, 
        alignSelf:'center'
    },
    inputContainer: {
        paddingHorizontal: 20,
    },
    signupText: {
        color: 'blue',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default LoginScreen;
