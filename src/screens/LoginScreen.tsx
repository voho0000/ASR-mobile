import React, { useState } from 'react';
import { Button, TextInput, View, StyleSheet, Alert, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_API_KEY } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { login } from '../services/auth';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type LoginScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'LoginScreen'
>;

const LoginScreen = ({ navigation }: { navigation: LoginScreenNavigationProp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const resData = await login(email, password);
            if (resData.idToken && resData.localId) {
                await AsyncStorage.setItem('userToken', resData.idToken);
                await AsyncStorage.setItem('userID', resData.localId);
                navigation.replace('HomeScreen');
            }
        } catch (error: any) {
            Alert.alert('Authentication failed', error.message, [{ text: 'Okay' }]);
        }
    };

    const switchToSignup = () => {
        navigation.navigate('SignupScreen');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} placeholder="Email" onChangeText={setEmail} value={email} />
                    <TextInput style={styles.input} placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry />
                    <Button title="Log In" onPress={handleLogin} />
                    <TouchableOpacity onPress={switchToSignup}>
                        <Text style={styles.signupText}>Don't have an account? Sign up!</Text>
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
    signupText: {
        color: 'blue',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default LoginScreen;
