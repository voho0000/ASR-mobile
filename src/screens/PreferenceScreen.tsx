import { useState, useEffect } from 'react';
import { StyleSheet, Keyboard, Dimensions } from 'react-native';
import { TextInput, Button, TouchableRipple, Paragraph, List, Divider } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updateCommonWords, updateGptPrompt, fetchPreferences } from '../services/FirestoreService';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const windowHeight = Dimensions.get('window').height;

type PreferenceNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'PreferenceScreen'
>;

const PreferenceScreen = ({ navigation }: { navigation: PreferenceNavigationProp }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [commonWords, setCommonWords] = useState<string>('');

    const savePreferences = async () => {
        try {
            await updateCommonWords(commonWords);
            await updateGptPrompt(prompt);
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Success',
                text2: 'Successfully save preferences',
                visibilityTime: 2000,
                autoHide: true,
                bottomOffset: 40,
            });
            navigation.goBack()
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    };

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await fetchPreferences();
                setPrompt(preferences.gptPrompt);
                setCommonWords(preferences.commonWords);
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
                // Handle the error, possibly by informing the user about it
            }
        };

        loadPreferences();
    }, []);  // The empty dependency array makes sure this effect runs only once, when the component mounts


    return (
        <TouchableRipple onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <KeyboardAwareScrollView contentContainerStyle={styles.container}>
                <List.Section>
                    <List.Subheader style={{ fontWeight: 'bold' }}>Speech Recognition</List.Subheader>
                    <Paragraph style={styles.helperText}>
                        For improved speech recognition, enter your common words as: word1, word2, word3. Don't exceed 30 words.
                    </Paragraph>
                    <TextInput
                        label="Common Words"
                        value={commonWords}
                        mode="outlined"
                        multiline
                        onChangeText={setCommonWords}
                        style={styles.input}
                        placeholder="Enter common words here"
                    />
                </List.Section>
                <Divider />
                <List.Section>
                    <List.Subheader style={{ fontWeight: 'bold' }}>GPT Settings</List.Subheader>
                    <Paragraph style={styles.helperText}>
                        GPT prompt is to guide the GPT model in generating a response
                    </Paragraph>
                    <TextInput
                        label="GPT Prompt"
                        value={prompt}
                        mode="outlined"
                        multiline
                        onChangeText={setPrompt}
                        style={styles.input}
                        placeholder="Enter GPT prompt here"
                        theme={{ colors: { primary: 'teal' } }}
                    />
                </List.Section>
                <Button
                    mode="contained"
                    onPress={savePreferences}
                    contentStyle={{ height: 50 }}  // adjust this based on your requirement
                    labelStyle={{ color: 'white' }}
                >
                    Save Preferences
                </Button>

            </KeyboardAwareScrollView>
        </TouchableRipple>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 15,
        backgroundColor: '#fff',
    },
    input: {
        marginBottom: 10,
        height: windowHeight * 0.2,
        backgroundColor: '#f0f0f0'
    },
    helperText: {
        fontSize: 10,
        color: '#616161', // you can adjust this color
    },
});

export default PreferenceScreen;
