import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createUser } from '../services/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { TextInput, Button, HelperText, Snackbar, Text } from 'react-native-paper';
import { initializePreferences, createUserInfo } from '../services/FirestoreService';
import CustomSelectDropdown from '../components/CustomSelectDropdown'; // Using CustomSelectDropdown
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { functions } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";

type SignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'SignupScreen'
>;

type SexType = 'Male' | 'Female' | null;
type PositionType = 'Medical Student' | 'PGY' | 'Resident' | 'Fellow' | 'Attending' | 'Other' | null;

const SignupScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [visible, setVisible] = useState(false);
    const [sex, setSex] = useState<SexType>(null);
    const [birthday, setBirthday] = useState<string>('');
    const [position, setPosition] = useState<PositionType>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Now `sexData` and `positionData` are simple arrays of strings
    const sexData = ['Male', 'Female'];
    const positionData = [
        'Medical Student', 'PGY', 'Resident',
        'Fellow', 'Attending', 'Other'
    ];

    const handleDateChange = (input: string) => {
        setBirthday(input);
    };

    const signupHandler = async () => {
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please confirm your password correctly.');
            setVisible(true);
            return;
        }
        try {
            setIsLoading(true);
            const user = await createUser(email.trim(), password);
            if (user && sex && position && birthday) {
                try {
                    await initializePreferences();
                    await createUserInfo(user.uid, email.trim(), sex, birthday, position);
                    const addDefaultPrompts = httpsCallable(functions, 'addDefaultPrompts');
                    await addDefaultPrompts({ userId: user.uid });
                    
                    Toast.show({
                        type: 'success',
                        position: 'top',
                        text1: 'Success',
                        text2: 'Successfully created account. Please verify your email address.',
                        visibilityTime: 2000,
                        autoHide: true,
                        bottomOffset: 40,
                    });
                    navigation.replace('LoginScreen');
                } catch (error) {
                    console.error('Failed to initialize preferences:', error);
                }
            }
        } catch (error: any) {
            setErrorMessage('Signup failed: ' + error.message);
            setVisible(true);
        }
        setIsLoading(false);
    };

    return (
        <KeyboardAwareScrollView>
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        mode="outlined"
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.inputField}
                    />
                    <TextInput
                        mode="outlined"
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.inputField}
                    />
                    <TextInput
                        mode="outlined"
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        style={styles.inputField}
                    />
                    <Text>Sex</Text>

                    {/* Use CustomSelectDropdown for sex */}
                    <CustomSelectDropdown
                        data={sexData}
                        selectedItem={sex || 'Select sex'}
                        setSelectedItem={(item) => setSex(item as SexType)}
                        getItemLabel={(item) => item}
                    />

                    <View style={styles.datePickerContainer}>
                        <Text>Birthday</Text>
                        <TextInput
                            mode="outlined"
                            label="format : 20230731"
                            placeholder="format : 20230731"
                            value={birthday}
                            onChangeText={handleDateChange}
                            style={styles.inputField}
                            keyboardType="numeric"
                        />
                    </View>

                    <Text>Position</Text>

                    {/* Use CustomSelectDropdown for position */}
                    <CustomSelectDropdown
                        data={positionData}
                        selectedItem={position || 'Select position'}
                        setSelectedItem={(item) => setPosition(item as PositionType)}
                        getItemLabel={(item) => item}
                    />

                    <HelperText type="error" visible={password !== confirmPassword}>
                        Passwords do not match
                    </HelperText>
                    <HelperText type="error" visible={birthday.length !== 8}>
                        Birthday must be eight digits.
                    </HelperText>
                    <HelperText type="error" visible={password.length < 6}>
                        Password must be at least 6 characters.
                    </HelperText>

                    <Button
                        mode="contained"
                        onPress={signupHandler}
                        loading={isLoading}
                        disabled={isLoading || !email || password.length < 6 || !password || !confirmPassword || !sex || !position || birthday.length !== 8}
                    >
                        Sign Up
                    </Button>

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
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
    },
    inputContainer: {
        width: '95%',
    },
    inputField: {
        marginBottom: 15,
    },
    datePickerContainer: {
        marginBottom: 10,
        height: 70,
        width: '100%',
    },
});

export default SignupScreen;