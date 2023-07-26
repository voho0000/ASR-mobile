// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchPatientRecords, addPatientRecord, deletePatientRecord } from '../services/FirestoreService';
import { logout } from '../services/auth';
import { Button, List, Dialog, Portal, Paragraph, TextInput, HelperText, IconButton, Divider  } from 'react-native-paper';  // Imported from react-native-paper
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

// import CustomButtom from '../components/CustomButtom';

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'HomeScreen'
>;

const HomeScreen = () => {
    const [items, setItems] = useState<string[]>([]);
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const isFocused = useIsFocused();
    const [visible, setVisible] = useState(false); // State for Dialog visibility
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // new state for the selected index

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const [logoutVisible, setLogoutVisible] = useState(false);
    const showLogoutDialog = () => setLogoutVisible(true);
    const hideLogoutDialog = () => setLogoutVisible(false);

    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const showAddDialog = () => setAddDialogVisible(true);
    const hideAddDialog = () => setAddDialogVisible(false);

    const [isInputValid, setIsInputValid] = useState(true);


    useEffect(() => {
        if (isFocused) {
            fetchPatientRecords().then(response => {
                if (response) {
                    setItems(response); // Assuming response is an array of items
                }
            }).catch(error => {
                console.log('Error fetching patient records:', error);
            });
        }
    }, [isFocused]);

    const handleAddPatient = () => {
        const newItems = [...items, inputValue];
        setItems(newItems);
        addPatientRecord(inputValue);
        hideAddDialog();
        setInputValue(''); // reset input value after adding
    };

    const handlePressItem = (item: string) => {
        navigation.navigate('RecordingScreen', { name: item });
    };

    const deleteItem = async () => {
        if (selectedIndex !== null) { // ensure selectedIndex is set
            const patientId = items[selectedIndex];
            try {
                // Delete the record from Firestore
                await deletePatientRecord(patientId);
                const newItems = items.filter((_, itemIndex) => itemIndex !== selectedIndex);
                setItems(newItems);
            } catch (error) {
                console.error("Failed to delete item:", error);
            }
        }
    };

    return (
        <View style={{ flex: 1, padding: 10, backgroundColor: '#fff' }}>
            <Button mode="contained" onPress={showAddDialog}>Add a Patient</Button>
            <Portal>
                <Dialog visible={addDialogVisible} onDismiss={hideAddDialog}>
                    <Dialog.Title>Add a Patient</Dialog.Title>
                    <Dialog.Content>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                <TextInput
                                    label="Patient ID"
                                    value={inputValue}
                                    onChangeText={text => {
                                        setInputValue(text);
                                        setIsInputValid(!items.includes(text)); // update validation state whenever the text changes
                                    }}
                                    style={{ backgroundColor: 'white' }}
                                />
                                <HelperText type="error" visible={!isInputValid}>
                                    Patient ID already exists. Please enter a unique ID.
                                </HelperText>
                            </View>
                        </TouchableWithoutFeedback>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideAddDialog}>Cancel</Button>
                        <Button onPress={handleAddPatient} disabled={!isInputValid || inputValue.trim() === ''}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <List.Item
                        title={item}
                        onPress={() => handlePressItem(item)}
                        right={props =>
                            <IconButton
                                {...props}
                                icon="delete"
                                size={30}
                                onPress={() => {
                                    setSelectedIndex(index);
                                    showDialog();
                                }}
                            />
                        }
                    />
                )}
                ItemSeparatorComponent={() => <Divider />}
            />
            <Button mode="outlined" onPress={() => {
                showLogoutDialog()
            }}>Log Out</Button>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Delete item</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Are you sure you want to delete this item?</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideDialog}>No</Button>
                        <Button onPress={() => { hideDialog(); deleteItem() }}>Yes</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog visible={logoutVisible} onDismiss={hideLogoutDialog}>
                    <Dialog.Title>Log Out</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Are you sure you want to log out?</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideLogoutDialog}>No</Button>
                        <Button onPress={() => {
                            hideLogoutDialog();
                            logout().then(() => navigation.replace('LoginScreen'));
                        }}>Yes</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    text: {
        fontSize: 18,
    },
});

export default HomeScreen;
