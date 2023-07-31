import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard} from 'react-native';
import { fetchUserInfo, updateUserInfo } from '../services/FirestoreService';
import { RootStackParamList } from '../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SelectDropdown from 'react-native-select-dropdown';


type SexType = 'Male' | 'Female' | null;
type PositionType = 'Medical Student' | 'Intern' | 'PGY' | 'Resident' | 'Fellow' | 'Attending' | 'Other' | null;

type ProfileNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ProfileScreen'
>;

type SelectDropdownItem = { label: string; value: string };

const ProfileScreen = ({ navigation }: { navigation: ProfileNavigationProp }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sex, setSex] = useState<SexType>(null);
    const [birthday, setBirthday] = useState<string>('');
    const [position, setPosition] = useState<PositionType>(null);
    const [openSex, setOpenSex] = useState(false);
    const [openPosition, setOpenPosition] = useState(false);

    const handleDateChange = (input: string) => {
        setBirthday(input);
    };

    const sexData: SelectDropdownItem[] = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
    ];

    const positionData: SelectDropdownItem[] = [
        { label: 'Medical Student', value: 'Medical Student' },
        { label: 'Intern', value: 'Intern' },
        { label: 'PGY', value: 'PGY' },
        { label: 'Resident', value: 'Resident' },
        { label: 'Fellow', value: 'Fellow' },
        { label: 'Attending', value: 'Attending' },
        { label: 'Other', value: 'Other' },
    ];

    const saveProfile = async () => {
        try {
            if (sex && position && birthday) {
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
                setBirthday(userInfo.birthday);
                setPosition(userInfo.position);
                // Now you have the user info, you can use it to set the state or do something else.
            } catch (error) {
                console.error('Failed to fetch user info:', error);
                // Handle the error, possibly by informing the user about it
            }finally{
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
        <KeyboardAwareScrollView >
            <View style={styles.container}>
                <Text style={styles.label}>Sex</Text>
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
                    defaultButtonText={sex || "Select sex"}
                />
                <Text style={styles.label}>Birthday</Text>
                <TextInput
                    mode="outlined"
                    label="format : 20230731"
                    placeholder='format : 20230731'
                    value={birthday}
                    onChangeText={handleDateChange}
                    style={{}}
                    keyboardType="numeric"
                />
                <Text style={styles.label}>Position</Text>
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
                <Button
                    mode="contained"
                    onPress={saveProfile}
                    disabled={sex === null || position === null}
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
    },
    label: {
        marginBottom: 10,
        marginTop: 40,
    },
    datePickerContainer: {
        marginBottom: 50,
        alignItems: 'center',
    },
    dropDownPicker: {
        marginBottom: 50,
    },
    saveButtonContainer: {
        marginTop: 30,
    },
    saveButton: {
        marginTop: 50,
        // position: 'absolute',
        // bottom: 25,
        alignSelf: 'center',
        width: '100%'
    }
});

export default ProfileScreen;
