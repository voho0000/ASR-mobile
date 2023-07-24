import React, { useState } from 'react';
import { TouchableOpacity, TextInput, View, StyleSheet, Alert, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser } from '../services/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message';

type SignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'SignupScreen'
>;

const SignupScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const signupHandler = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Passwords do not match', 'Please confirm your password correctly', [{ text: 'Okay' }]);
            return;
        }

        try {
            const { idToken } = await createUser(email, password);
            if (idToken) {
                await AsyncStorage.setItem('userToken', idToken);
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
            Alert.alert('Signup failed', error.message, [{ text: 'Okay' }]);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Comfirm Password" secureTextEntry />

                    <TouchableOpacity style={styles.button} onPress={signupHandler}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    inputContainer: {
        paddingHorizontal: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    loginText: {
        color: 'blue',
        textAlign: 'center',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        margin: 10,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: 'gray', // or another color of your choice
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
});

export default SignupScreen;
