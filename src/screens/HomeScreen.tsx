// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, Platform } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchPatientRecords, addPatientRecord, deletePatientRecord, renamePatientId } from '../services/FirestoreService';
import { Button, List, Dialog, Portal, Paragraph, TextInput, HelperText, IconButton, Divider, ActivityIndicator } from 'react-native-paper';  // Imported from react-native-paper
import { SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


// import CustomButtom from '../components/CustomButtom';

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'HomeScreen'
>;

const HomeScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [items, setItems] = useState<{ id: string, info: string, lastEdited?: Date }[]>([]);
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
                    // Sort items by lastEdited (newest to oldest)
                    const sortedItems = response.sort((a, b) => {
                        if (!a.lastEdited) { return 1; }; // 如果 a 沒有 lastEdited，排在後面
                        if (!b.lastEdited) { return -1; };// 如果 b 沒有 lastEdited，排在前面
                        return b.lastEdited.getTime() - a.lastEdited.getTime(); // 否則按時間排序
                    }); setItems(sortedItems);
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

    // Handle adding a new patient and updating items
    const handleAddPatient = async () => {
        setIsAdding(true);
        try {
            const currentDate = new Date(); // Get local date
            await addPatientRecord(inputValue, currentDate);
            const newItems = [...items, { id: inputValue, info: '', lastEdited: currentDate }];
            // Sort after adding
            const sortedItems = newItems.sort((a, b) => {
                if (!a.lastEdited) { return 1 };
                if (!b.lastEdited) { return -1 };
                return b.lastEdited.getTime() - a.lastEdited.getTime();
            });
            setItems(sortedItems);
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

    // Handle renaming a patient and updating items
    const handleEditPatient = async () => {
        const nameExists = items.some((item, idx) => item.id === editedValue && idx !== editIndex);
        if (nameExists) {
            setIsEditValid(false);
            return; // Don't proceed if the name is not unique
        }

        if (editIndex !== null) {
            setIsRenaming(true); // Start the loading spinner
            try {
                const oldPatientId = items[editIndex].id;
                const newPatientId = editedValue;
                const currentDate = new Date(); // Get local date
                await renamePatientId(oldPatientId, newPatientId, currentDate);

                const newItems = [...items];
                newItems[editIndex] = { ...newItems[editIndex], id: newPatientId, lastEdited: currentDate };
                // Sort after renaming
                const sortedItems = newItems.sort((a, b) => {
                    if (!a.lastEdited) { return 1 };
                    if (!b.lastEdited) { return -1 };
                    return b.lastEdited.getTime() - a.lastEdited.getTime();
                });
                setItems(sortedItems);
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
                            <KeyboardAwareScrollView >
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
                            </KeyboardAwareScrollView>
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
                        style={{ paddingVertical: 0, minHeight: 65 }} // Ensure the row has a consistent height
                        title={() => (
                            <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
                                {/* Title section with fixed space at the top */}
                                <View style={{ minHeight: 20 }}> {/* Fixed space for the title */}
                                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                                        {item.id}
                                    </Text>
                                </View>
                            </View>
                        )}
                        description={() => (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 5 }}>
                                {/* Left side: Last edited with fixed width */}
                                <View style={{ width: 70 }}> {/* Fixed width for date */}
                                    <Text
                                        style={{ fontSize: 12, color: '#6b6b6b', overflow: 'hidden' }}
                                        numberOfLines={1} // Limit to one line for the date
                                    >
                                        {item.lastEdited ? new Date(item.lastEdited).toLocaleDateString() : ''}
                                    </Text>
                                </View>
            
                                {/* Right side: Patient info */}
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text
                                        style={{ fontSize: 12, color: '#6b6b6b', overflow: 'hidden', textAlign: 'left' }}
                                        numberOfLines={2} // Limit to two lines for patient info
                                    >
                                        {item.info ? item.info+'\n' : '\n'}
                                    </Text>
                                </View>
                            </View>
                        )}
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
                            <KeyboardAwareScrollView >
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
                            </KeyboardAwareScrollView >
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