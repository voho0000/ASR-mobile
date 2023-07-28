import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { fetchUserInfo, updateUserInfo } from '../services/FirestoreService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Button, Text } from 'react-native-paper';

type SexType = 'Male' | 'Female' | null;
type PositionType = 'Medical Student' | 'Intern' | 'PGY' | 'Resident' | 'Fellow' | 'Attending' | 'Other' | null;

type ProfileNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ProfileScreen'
>;


const ProfileScreen = ({ navigation }: { navigation: ProfileNavigationProp }) => {
    const [sex, setSex] = useState<SexType>(null);
    const [birthday, setBirthday] = useState(new Date());
    const [position, setPosition] = useState<PositionType>(null);
    const [openSex, setOpenSex] = useState(false);
    const [openPosition, setOpenPosition] = useState(false);

    const handleConfirm = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || birthday;
        setBirthday(currentDate);
    };

    const saveProfile = async () => {
        try {
            if (sex && position) {
                await updateUserInfo(sex, birthday, position);
                Toast.show({
                    type: 'success',
                    position: 'top',
                    text1: 'Success',
                    text2: 'Successfully save profile',
                    visibilityTime: 2000,
                    autoHide: true,
                    bottomOffset: 40,
                });
                navigation.goBack()
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
                setBirthday(userInfo.birthday.toDate());
                setPosition(userInfo.position);
                // Now you have the user info, you can use it to set the state or do something else.
            } catch (error) {
                console.error('Failed to fetch user info:', error);
                // Handle the error, possibly by informing the user about it
            }
        };

        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Sex</Text>
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
            <Text style={styles.label}>Birthday</Text>
            <View style={styles.datePickerContainer}>
                <DateTimePicker
                    testID="dateTimePicker"
                    value={birthday}
                    mode={"date"}
                    display="default"
                    onChange={handleConfirm}
                />

            </View>
            <Text style={styles.label}>Position</Text>
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
            <Button
                mode="contained"
                onPress={saveProfile}
                disabled={sex === null || position === null}
                style={styles.saveButton}
            >
                Save Profile
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center'
    },
    label: {
        marginBottom: 10,
    },
    datePickerContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    dropDownPicker: {
        marginBottom: 50,
    },
    saveButtonContainer: {
        marginTop: 30,
    },
    saveButton: {
        marginTop: 20,
    }
});

export default ProfileScreen;
