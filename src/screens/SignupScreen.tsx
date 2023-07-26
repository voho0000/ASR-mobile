// SignupScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { createUser } from '../services/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message';
import CustomButtom from '../components/CustomButtom';
import { TextInput, Button, HelperText, Snackbar, Text } from 'react-native-paper';


type SignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'SignupScreen'
>;

const SignupScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [visible, setVisible] = useState(false);

    const signupHandler = async () => {
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please confirm your password correctly.');
            setVisible(true);
            return;
        }

        try {
            const user = await createUser(email, password);
            if (user) {
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Success',
                    text2: 'Successfully created account',
                    visibilityTime: 2000,
                    autoHide: true,
                    bottomOffset: 40,
                });
                navigation.replace('LoginScreen');
            }
        } catch (error: any) {
            setErrorMessage('Signup failed: ' + error.message);
            setVisible(true);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        mode="outlined"
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        mode="outlined"
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{ marginTop: 5 }}
                    />
                    <TextInput
                        mode="outlined"
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        style={{ marginTop: 5 }}
                    />
                    <HelperText type="error" visible={password !== confirmPassword}>
                        Passwords do not match
                    </HelperText>
                    <Button mode="contained" onPress={signupHandler}>Sign Up</Button>
                    <Text
                        onPress={() => navigation.replace('LoginScreen')}
                        style={{ textDecorationLine: 'underline', fontSize: 14, textAlign: 'center', marginTop: 20 }}
                    >
                        Already have an account? Log in!
                    </Text>
                </View>
                <Snackbar
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                >
                    {errorMessage}
                </Snackbar>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    inputContainer: {
        width: '100%',
    },
});

export default SignupScreen;
