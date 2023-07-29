// SignupScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native';
import { createUser } from '../services/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { TextInput, Button, HelperText, Snackbar, Text } from 'react-native-paper';
import { initializePreferences, createUserInfo } from '../services/FirestoreService';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

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
    const [birthday, setBirthday] = useState(new Date());
    const [position, setPosition] = useState<PositionType>(null);
    const [openSex, setOpenSex] = useState(false);
    const [openPosition, setOpenPosition] = useState(false);

    const today = new Date();
    const isBirthdayToday = birthday.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);

    const handleConfirm = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || birthday;
        setBirthday(currentDate);
    };

    const signupHandler = async () => {
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please confirm your password correctly.');
            setVisible(true);
            return;
        }
        try {
            const user = await createUser(email, password);
            if (user && sex && position) {
                try {
                    await initializePreferences();  // Initialize the preferences document for this user
                    await createUserInfo(user.uid, email, sex, birthday, position);
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
    };


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

                    <DropDownPicker
                        open={openSex}
                        value={sex}
                        items={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                        ]}
                        setOpen={setOpenSex}
                        setValue={setSex}
                        setItems={() => { }}
                        placeholder="Select sex"
                        style={styles.dropDownPicker}
                    />
                    <View style={styles.datePickerContainer}>
                        <Text >Birthday</Text>
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={birthday || new Date()}
                            mode={"date"}
                            display="compact"
                            onChange={handleConfirm}
                            style={styles.datePicker}
                        />
                    </View>
                    <Text >Position</Text>

                    <DropDownPicker
                        open={openPosition}
                        value={position}
                        items={[
                            { label: 'Medical Student', value: 'Medical Student' },
                            { label: 'Intern', value: 'Intern' },
                            { label: 'PGY', value: 'PGY' },
                            { label: 'Resident', value: 'Resident' },
                            { label: 'Fellow', value: 'Fellow' },
                            { label: 'Attending', value: 'Attending' },
                            { label: 'Other', value: 'Other' },
                        ]}
                        setOpen={setOpenPosition}
                        setValue={setPosition}
                        setItems={() => { }}
                        placeholder="Select position"
                        style={styles.dropDownPicker}
                    />
                    <HelperText type="error" visible={password !== confirmPassword}>
                        Passwords do not match
                    </HelperText>
                    <HelperText type="error" visible={isBirthdayToday}>
                        You cannot select today as your birthday.
                    </HelperText>
                    <HelperText type="error" visible={password.length < 6}>
                        Password must be at least 6 characters.
                    </HelperText>
                    <Button mode="contained" onPress={signupHandler} disabled={!email || password.length < 6|| !password || !confirmPassword || !sex || !position || isBirthdayToday}>Sign Up</Button>
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
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
