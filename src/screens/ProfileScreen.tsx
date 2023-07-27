import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ProfileScreen'
>;
const ProfileScreen = () => {
    const [prompt, setPrompt] = useState('');
    const [commonWords, setCommonWords] = useState('');
    const navigation = useNavigation();

    const handleSave = () => {
        // save prompt and commonWords to some storage
        // for example, AsyncStorage, your own API, Firebase Firestore, etc.

        // navigate back to the previous screen after saving
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Settings</Title>
            <TextInput
                label="Prompt"
                value={prompt}
                onChangeText={setPrompt}
                style={styles.input}
                multiline
            />
            <TextInput
                label="Common Words"
                value={commonWords}
                onChangeText={setCommonWords}
                style={styles.input}
                multiline
            />
            <Button mode="contained" onPress={handleSave}>
                Save
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        marginBottom: 20,
    },
    input: {
        marginBottom: 10,
    },
});

export default ProfileScreen;
