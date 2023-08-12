// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchPatientRecords, addPatientRecord, deletePatientRecord, renamePatientId } from '../services/FirestoreService';
import { Button, List, Dialog, Portal, Paragraph, TextInput, HelperText, IconButton, Divider, ActivityIndicator } from 'react-native-paper';  // Imported from react-native-paper
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native';

// import CustomButtom from '../components/CustomButtom';

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'HomeScreen'
>;

const HomeScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<{ id: string, info: string }[]>([]);
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const isFocused = useIsFocused();
    const [visible, setVisible] = useState(false); // State for Dialog visibility
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // new state for the selected index

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const showAddDialog = () => setAddDialogVisible(true);
    const hideAddDialog = () => setAddDialogVisible(false);

    const [isInputValid, setIsInputValid] = useState(true);
    const [isNameUnique, setIsNameUnique] = useState(true);
    const [isNameWithinLimit, setIsNameWithinLimit] = useState(true);

    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editedValue, setEditedValue] = useState('');
    const [editIndex, setEditIndex] = useState<number | null>(null);

    const [isEditValid, setIsEditValid] = useState(true);
    const [isEditNameUnique, setIsEditNameUnique] = useState(true);
    const [isEditNameWithinLimit, setIsEditNameWithinLimit] = useState(true);

    const [isRenaming, setIsRenaming] = useState(false); // New state for renaming spinner

    const [isDeleting, setIsDeleting] = useState(false); // New state for delete spinner

    const [isAdding, setIsAdding] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchPatientRecords();
                if (response) {
                    setItems(response); // Assuming response is an array of items
                }
            } catch (error) {
                console.log('Error fetching patient records:', error);
            } finally {
                setIsLoading(false); // Finish loading
            }
        }
            ;
        if (isFocused) {
            fetchData();
        }
    }, [isFocused]);

    const handleAddPatient = async () => {
        setIsAdding(true);
        try {
            await addPatientRecord(inputValue);
            const newItems = [...items, { id: inputValue, info: '' }];
            setItems(newItems);
            navigation.navigate('RecordingScreen', { name: inputValue });
        } catch (error) {
            console.error("Error adding patient:", error);
        } finally {
            setIsAdding(false);
            hideAddDialog();
            setInputValue(''); // reset input value after adding
        }
    };


    const handlePressItem = (itemId: string) => {
        navigation.navigate('RecordingScreen', { name: itemId });
    };

    const deleteItem = async () => {
        if (selectedIndex !== null) { // ensure selectedIndex is set
            const patientId = items[selectedIndex].id;
            setIsDeleting(true); // Start the loading spinner
            try {
                // Delete the record from Firestore
                await deletePatientRecord(patientId);
                const newItems = items.filter((_, itemIndex) => itemIndex !== selectedIndex);
                setItems(newItems);
            } catch (error) {
                console.error("Failed to delete item:", error);
            } finally {
                setIsDeleting(false); // End the loading spinner
                hideDialog();
            }
        }
    };

    const showEditDialog = (index: number) => {
        setEditIndex(index);
        setEditedValue(items[index].id); // Assuming the item's name is its ID
        setEditDialogVisible(true);
    };

    const handleEditPatient = async () => {
        const nameExists = items.some((item, idx) => item.id === editedValue && idx !== editIndex);
        if (nameExists) {
            setIsEditValid(false);
            return; // don't proceed if the name is not unique
        }

        if (editIndex !== null) {
            setIsRenaming(true); // Start the loading spinner
            try {
                const oldPatientId = items[editIndex].id;
                const newPatientId = editedValue;
                await renamePatientId(oldPatientId, newPatientId);

                const newItems = [...items];
                newItems[editIndex].id = editedValue;
                setItems(newItems);
            } catch (error) {
                console.error("Error renaming patient:", error);
            } finally {
                setIsRenaming(false); // End the loading spinner
                setEditDialogVisible(false);
            }
        }
    };



    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, marginTop: Platform.OS === 'android' ? 24 : 0 }}>
            <View style={{ flex: 1, paddingLeft: 10, backgroundColor: '#fff', width: '100%', maxWidth: 1000, alignSelf: 'center' }}>
                <Portal>
                    <Dialog visible={addDialogVisible} onDismiss={hideAddDialog} style={styles.dialogWrapper}>
                        <Dialog.Title>Add a Patient</Dialog.Title>
                        <Dialog.Content>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View>
                                    <TextInput
                                        label="Patient ID"
                                        value={inputValue}
                                        onChangeText={text => {
                                            setInputValue(text);
                                            const isUnique = !items.map(item => item.id).includes(text);
                                            const isWithinLimit = text.length <= 15;
                                            setIsInputValid(isUnique && isWithinLimit); // combined validation state
                                            setIsNameUnique(isUnique); // individual validation state for name uniqueness
                                            setIsNameWithinLimit(isWithinLimit); // individual validation state for name length
                                        }}
                                        style={{ backgroundColor: 'white' }}
                                    />
                                    <HelperText type="error" visible={!isNameUnique}>
                                        Patient ID already exists. Please enter a unique ID.
                                    </HelperText>
                                    <HelperText type="error" visible={!isNameWithinLimit}>
                                        Patient ID cannot exceed 15 characters.
                                    </HelperText>
                                </View>
                            </TouchableWithoutFeedback>
                        </Dialog.Content>
                        <Dialog.Actions>
                            {isAdding && (
                                <View style={{ marginLeft: 10 }}>
                                    <ActivityIndicator animating={true} size="small" />
                                </View>
                            )}
                            <Button onPress={hideAddDialog}>Cancel</Button>
                            <Button onPress={handleAddPatient} disabled={isAdding || !isInputValid || inputValue.trim() === ''}>Add</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <FlatList
                    data={items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <List.Item
                            title={item.id}
                            description={item.info}
                            descriptionNumberOfLines={2} // limit the number of lines for description
                            descriptionStyle={{ fontSize: 12, overflow: 'hidden' }} // hide overflowing text
                            style={{ paddingVertical: 0 }} // enforce a consistent height and remove vertical padding
                            onPress={() => handlePressItem(item.id)}
                            right={props =>
                            (
                                <>
                                    <IconButton
                                        {...props}
                                        icon="pencil"
                                        size={30}
                                        onPress={() => showEditDialog(index)}
                                    />
                                    <IconButton
                                        {...props}
                                        icon="delete"
                                        size={30}
                                        onPress={() => {
                                            setSelectedIndex(index);
                                            showDialog();
                                        }}
                                    />
                                </>
                            )
                            }
                        />
                    )}
                    ItemSeparatorComponent={() => <Divider />}
                />
                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog} style={styles.dialogWrapper}>
                        <Dialog.Title>Delete item</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>Are you sure you want to delete this item?</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            {isDeleting && (
                                <View style={{ marginLeft: 10 }}>
                                    <ActivityIndicator animating={true} size="small" />
                                </View>
                            )}
                            <Button onPress={hideDialog} disabled={isDeleting}>No</Button>
                            <Button onPress={deleteItem} disabled={isDeleting}>Yes</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <Portal>
                    <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)} style={styles.dialogWrapper}>
                        <Dialog.Title>Edit Patient</Dialog.Title>
                        <Dialog.Content>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View>
                                    <TextInput
                                        label="Patient ID"
                                        value={editedValue}
                                        onChangeText={text => {
                                            setEditedValue(text);
                                            const isUnique = !items.map(item => item.id).includes(text);
                                            const isWithinLimit = text.length <= 15;
                                            setIsEditValid(isUnique && isWithinLimit); // combined validation state
                                            setIsEditNameUnique(isUnique); // individual validation state for name uniqueness
                                            setIsEditNameWithinLimit(isWithinLimit); // individual validation state for name length
                                        }}
                                        style={{ backgroundColor: 'white' }}
                                    />
                                    <HelperText type="error" visible={!isEditNameUnique}>
                                        Patient ID already exists. Please enter a unique ID.
                                    </HelperText>
                                    <HelperText type="error" visible={!isEditNameWithinLimit}>
                                        Patient ID cannot exceed 15 characters.
                                    </HelperText>
                                </View>
                            </TouchableWithoutFeedback>
                        </Dialog.Content>
                        <Dialog.Actions>
                            {isRenaming && (
                                <View style={{ marginLeft: 10 }}>
                                    <ActivityIndicator animating={true} size="small" />
                                </View>
                            )}
                            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
                            <Button onPress={handleEditPatient} disabled={!isEditValid || editedValue.trim() === '' || isRenaming}>Save</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <Button mode="contained" onPress={showAddDialog}>Add a Patient</Button>

            </View>
        </SafeAreaView >

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    dialogWrapper: {
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
        // alignItems: 'center', 
        justifyContent: 'center',
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