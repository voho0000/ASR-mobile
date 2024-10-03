import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { fetchUserInfo, updateUserInfo } from '../services/FirestoreService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Button, Text, TextInput, ActivityIndicator, HelperText } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomSelectDropdown from '../components/CustomSelectDropdown';

type SexType = 'Male' | 'Female' | null;
type PositionType = 'Medical Student' | 'PGY' | 'Resident' | 'Fellow' | 'Attending' | 'Other' | null;

type ProfileNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ProfileScreen'
>;

const ProfileScreen = ({ navigation }: { navigation: ProfileNavigationProp }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sex, setSex] = useState<SexType>(null);
    const [birthday, setBirthday] = useState<string>('');
    const [position, setPosition] = useState<PositionType>(null);
    const [birthdayError, setBirthdayError] = useState<boolean>(false); // State for birthday validation

    const handleDateChange = (input: string) => {
        setBirthday(input);
        setBirthdayError(input.length !== 8); // Show error if birthday is not 8 characters
    };

    const sexData = ['Male', 'Female'];
    const positionData = [
        'Medical Student', 'PGY', 'Resident', 'Fellow', 'Attending', 'Other'
    ];

    const saveProfile = async () => {
        if (birthday.length !== 8) {
            setBirthdayError(true); // Set error if birthday isn't valid
            return;
        }

        try {
            if (sex && position && birthday) {
                await updateUserInfo(sex, birthday, position);
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Success',
                    text2: 'Successfully saved profile',
                    visibilityTime: 2000,
                    autoHide: true,
                    bottomOffset: 40,
                });
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to update user info:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = await fetchUserInfo();
                setSex(userInfo.sex);
                setBirthday(userInfo.birthday);
                setPosition(userInfo.position);
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.label}>Sex</Text>

                {/* CustomSelectDropdown for Sex */}
                <CustomSelectDropdown
                    data={sexData}
                    selectedItem={sex || 'Select sex'}
                    setSelectedItem={(item) => setSex(item as SexType)}
                    getItemLabel={(item) => item}
                />

                <Text style={styles.label}>Birthday</Text>
                <TextInput
                    mode="outlined"
                    label="format : 20230731"
                    placeholder="format : 20230731"
                    value={birthday}
                    onChangeText={handleDateChange}
                    style={{}}
                    keyboardType="numeric"
                />

                {/* HelperText for Birthday validation */}
                <HelperText type="error" visible={birthdayError}>
                    Birthday must be exactly 8 digits.
                </HelperText>

                <Text style={styles.label}>Position</Text>

                {/* CustomSelectDropdown for Position */}
                <CustomSelectDropdown
                    data={positionData}
                    selectedItem={position || 'Select position'}
                    setSelectedItem={(item) => setPosition(item as PositionType)}
                    getItemLabel={(item) => item}
                />

                <Button
                    mode="contained"
                    onPress={saveProfile}
                    disabled={sex === null || position === null || birthday.length !== 8} // Disable button if birthday is invalid
                    style={styles.saveButton}
                >
                    Save Profile
                </Button>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
    },
    label: {
        marginBottom: 10,
        marginTop: 40,
    },
    saveButton: {
        marginTop: 50,
        alignSelf: 'center',
        width: '100%',
    },
});

export default ProfileScreen;