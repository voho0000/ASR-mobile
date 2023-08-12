// SignupScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { createUser } from '../services/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { TextInput, Button, HelperText, Snackbar, Text } from 'react-native-paper';
import { initializePreferences, createUserInfo } from '../services/FirestoreService';
import SelectDropdown from "react-native-select-dropdown";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

type SignupScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'SignupScreen'
>;

type SexType = 'Male' | 'Female' | null;
type PositionType = 'Medical Student' | 'Intern' | 'PGY' | 'Resident' | 'Fellow' | 'Attending' | 'Other' | null;


const SignupScreen = ({ navigation }: { navigation: SignupScreenNavigationProp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [visible, setVisible] = useState(false);
    const [sex, setSex] = useState<SexType>(null);
    const [birthday, setBirthday] = useState<string>('');
    const [position, setPosition] = useState<PositionType>(null);
    const [openSex, setOpenSex] = useState(false);
    const [openPosition, setOpenPosition] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Create constants for dropdown data
    const sexData = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];

    const positionData = [
        { label: 'Medical Student', value: 'Medical Student' },
        { label: 'Intern', value: 'Intern' },
        { label: 'PGY', value: 'PGY' },
        { label: 'Resident', value: 'Resident' },
        { label: 'Fellow', value: 'Fellow' },
        { label: 'Attending', value: 'Attending' },
        { label: 'Other', value: 'Other' }
    ];

    // const isBirthdayToday = birthday.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
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
                    await initializePreferences();  // Initialize the preferences document for this user
                    await createUserInfo(user.uid, email.trim(), sex, birthday, position);
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
                    // Handle the error, possibly by informing the user about it
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
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
            <View style={styles.container} >
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
                    <Text >Sex</Text>

                    <SelectDropdown
                        data={sexData}
                        onSelect={(selectedItem, index) => {
                            setSex(selectedItem.value);
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            return selectedItem.label;
                        }}
                        rowTextForSelection={(item, index) => {
                            return item.label;
                        }}
                        buttonStyle={{
                            width: '100%',
                            height: 50,
                            borderColor: '#c4c4c4',
                            borderWidth: 1,
                            borderRadius: 5,
                            justifyContent: 'flex-start',
                            paddingHorizontal: 10,
                            backgroundColor: '#fff',
                            marginTop: 10,
                            marginBottom: 10,
                        }}
                        buttonTextStyle={{ textAlign: 'center', color: '#000000' }}
                        dropdownStyle={{ marginTop: -30, borderColor: '#c4c4c4', borderWidth: 1, borderRadius: 5, backgroundColor: '#fff' }}
                        defaultButtonText={sex || "Select sex"} />
                    <View style={styles.datePickerContainer}>
                        <Text >Birthday</Text>
                        <TextInput
                            mode="outlined"
                            label="format : 20230731"
                            placeholder='format : 20230731'
                            value={birthday}
                            onChangeText={handleDateChange}
                            style={styles.inputField}
                            keyboardType="numeric"
                        />
                    </View>
                    <Text >Position</Text>

                    <SelectDropdown
                        data={positionData}
                        onSelect={(selectedItem, index) => {
                            setPosition(selectedItem.value);
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            return selectedItem.label;
                        }}
                        rowTextForSelection={(item, index) => {
                            return item.label;
                        }}
                        buttonStyle={{
                            width: '100%',
                            height: 50,
                            borderColor: '#c4c4c4',
                            borderWidth: 1,
                            borderRadius: 5,
                            justifyContent: 'flex-start',
                            paddingHorizontal: 10,
                            backgroundColor: '#fff',
                            marginTop: 10,
                            marginBottom: 10,
                        }}
                        buttonTextStyle={{ textAlign: 'center', color: '#000000' }}
                        dropdownStyle={{ marginTop: -30, borderColor: '#c4c4c4', borderWidth: 1, borderRadius: 5, backgroundColor: '#fff' }}
                        defaultButtonText={position || "Select position"}
                    />
                    <HelperText type="error" visible={password !== confirmPassword}>
                        Passwords do not match
                    </HelperText>
                    <HelperText type="error" visible={birthday.length != 8}>
                        Birthday must be eight digits.
                    </HelperText>
                    <HelperText type="error" visible={password.length < 6}>
                        Password must be at least 6 characters.
                    </HelperText>
                    <Button mode="contained" onPress={signupHandler} loading={isLoading} disabled={isLoading || !email || password.length < 6 || !password || !confirmPassword || !sex || !position || birthday.length != 8}>Sign Up</Button>
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
        {/* </TouchableWithoutFeedback> */}
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width:'100%', 
        maxWidth:1000, 
        alignSelf:'center'
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
        width: '100%'
    },
    dropDownPicker: {
        marginBottom: 10,
        marginTop: 5,
    },
    datePicker: {
        flex: 1,
        alignSelf: 'center',
    },
});

export default SignupScreen;
