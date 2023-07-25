// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { fetchPatientRecords, addPatientRecord, deletePatientRecord } from '../services/FirestoreService';
import { logout } from '../services/auth';

type HomeScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'HomeScreen'
>;

const HomeScreen = () => {
    const [items, setItems] = useState<string[]>([]);
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            fetchPatientRecords().then(response => {
                // You may want to check if the response is not null or undefined before setting it
                if (response) {
                    setItems(response); // Assuming response is an array of items
                }
            }).catch(error => {
                console.log('Error fetching patient records:', error);
            });
        }
    }, [isFocused]);

    const handleAddItem = () => {
        Alert.prompt('Enter patient id', '', (text) => {
            const newItems = [...items, text];
            setItems(newItems);
            addPatientRecord(text);
        });
    };

    const handlePressItem = (item: string) => {
        navigation.navigate('RecordingScreen', { name: item });
    };

    const deleteItem = async (index: number) => {
        if (Platform.OS === 'web') {
            const patientId = items[index];
            try {
                // Delete the record from Firestore
                await deletePatientRecord(patientId);
                const newItems = items.filter((_, itemIndex) => itemIndex !== index);
                setItems(newItems);
            } catch (error) {
                console.error("Failed to delete item:", error);
            }
        } else {
            Alert.alert(
                'Delete item', // Title of the dialog
                'Are you sure you want to delete this item?', // Message of the dialog
                [
                    {
                        text: 'No', // Text of the first button
                        onPress: () => {}, // Function to execute when the first button is pressed
                        style: 'cancel',
                    },
                    {
                        text: 'Yes', // Text of the second button
                        onPress: async () => { // Function to execute when the second button is pressed
                            const patientId = items[index];
                            try {
                                // Delete the record from Firestore
                                await deletePatientRecord(patientId);
                                const newItems = items.filter((_, itemIndex) => itemIndex !== index);
                                setItems(newItems);
                            } catch (error) {
                                console.error("Failed to delete item:", error);
                            }
                        }
                    },
                ],
                { cancelable: false }
            );
        }

    };


    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            logout().then(() => navigation.replace('LoginScreen'));
        } else {
            Alert.alert(
                'Log Out', // Title of the dialog
                'Are you sure you want to log out?', // Message of the dialog
                [
                    {
                        text: 'No', // Text of the first button
                        onPress: () => {}, // Function to execute when the first button is pressed
                        style: 'cancel',
                    },
                    {
                        text: 'Yes', // Text of the second button
                        onPress: async () => { // Function to execute when the second button is pressed
                            logout().then(() => navigation.replace('LoginScreen'));
                        }
                    },
                ],
                { cancelable: false }
            );
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleAddItem}>
                <Text style={styles.buttonText}>Add Patient Record</Text>
            </TouchableOpacity>
            <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handlePressItem(item)}>
                        <Text style={styles.text}>{item}</Text>
                        <Button title="Delete" onPress={() => deleteItem(index)} />
                    </TouchableOpacity>
                )}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
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
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        margin: 10,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
});

export default HomeScreen;
