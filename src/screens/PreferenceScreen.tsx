import { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Dimensions } from 'react-native';
import { TextInput, Button, Paragraph, List, Divider, Text, ActivityIndicator } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updatePreference, fetchPreferences, fetchPrompts } from '../services/FirestoreService';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import CustomSelectDropdown from '../components/CustomSelectDropdown';

const windowHeight = Dimensions.get('window').height;

type PreferenceNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'PreferenceScreen'
>;

type Model = {
    label: string;
    value: string;
};

interface Prompt {
    name: string;
    promptContent: string;
}

const PreferenceScreen = ({ navigation }: { navigation: PreferenceNavigationProp }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [commonWords, setCommonWords] = useState<string>('');
    const [selectPrompt, setSelectPrompt] = useState<string>('');
    const [prompts, setPrompts] = useState<Prompt[]>([]);

    const models: Model[] = [
        { label: 'GPT-4o-mini', value: 'gpt-4o-mini' },
        { label: 'GPT-4o', value: 'gpt-4o' },
    ];

    const [selectedModel, setSelectedModel] = useState<Model>(models[0]);  // Update to store object

    const formattedPrompts = prompts.map(prompt => prompt.name);

    const savePreferences = async () => {
        try {
            await updatePreference(commonWords, selectedModel.value, selectPrompt);  // Update to use selectedModel.value
            Toast.show({
                type: 'success',
                position: 'top',
                text1: 'Success',
                text2: 'Successfully saved preferences',
                visibilityTime: 2000,
                autoHide: true,
                bottomOffset: 40,
            });
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    };

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await fetchPreferences();
                setCommonWords(preferences.commonWords);
                const selectedModelFromPreferences = models.find(model => model.value === preferences.gptModel);
                if (selectedModelFromPreferences) {
                    setSelectedModel(selectedModelFromPreferences);
                }
                setSelectPrompt(preferences.defaultPrompt);

                const promptsData = await fetchPrompts();
                setPrompts(promptsData);
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
            <List.Section style={styles.commonWordContainer}>
                <Text style={{ fontWeight: 'bold' }}>Speech Recognition</Text>
                <Paragraph style={styles.helperText}>
                    For improved speech recognition, enter your common words as: word1, word2, word3. Don't exceed 30 words.
                </Paragraph>
                <TextInput
                    label="Common Words"
                    value={commonWords}
                    mode="outlined"
                    multiline
                    onChangeText={setCommonWords}
                    style={styles.commonWordsInput}
                    placeholder="Enter common words here"
                />
            </List.Section>
            <Divider />
            <List.Section>
                <Text style={{ fontWeight: 'bold' }}>GPT Settings</Text>
                <Paragraph style={styles.helperText}>Select the GPT model you want to use.</Paragraph>

                {/* Use CustomSelectDropdown for model selection */}
                <CustomSelectDropdown
                    data={models}
                    selectedItem={selectedModel}
                    setSelectedItem={setSelectedModel}
                    getItemLabel={(item: Model) => item.label}
                />
            </List.Section>
            <Divider />
            <List.Section>
                <Text style={{ fontWeight: 'bold' }}>Default Prompt</Text>
                <Paragraph style={styles.helperText}>Select the prompt as your default prompt.</Paragraph>

                {/* Use CustomSelectDropdown for prompt selection */}
                <CustomSelectDropdown
                    data={formattedPrompts}
                    selectedItem={selectPrompt}
                    setSelectedItem={setSelectPrompt}
                    getItemLabel={(item: string) => item}
                />
            </List.Section>
            <Button
                mode="contained"
                onPress={savePreferences}
                labelStyle={{ color: 'white' }}
                style={{ marginTop: 20, marginBottom: 20, alignSelf: 'center', width: '100%' }}
            >
                Save Preferences
            </Button>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 15,
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
    },
    commonWordsInput: {
        marginBottom: 10,
        height: windowHeight * 0.25,
        backgroundColor: '#f0f0f0',
    },
    commonWordContainer: {
        height: windowHeight * 0.35,
    },
    helperText: {
        fontSize: 10,
        color: '#616161',
    },
    subheader: {
        fontWeight: 'bold',
    },
});

export default PreferenceScreen;