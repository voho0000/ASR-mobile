import { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, Dimensions  } from 'react-native';
import { TextInput, Button, TouchableRipple, Paragraph, List, Divider, Text, ActivityIndicator } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { updatePreference, fetchPreferences, fetchPrompts } from '../services/FirestoreService';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import SelectDropdown from "react-native-select-dropdown";

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
    const [prompt, setPrompt] = useState<string>('');
    const [commonWords, setCommonWords] = useState<string>('');
    const [openGpt, setOpenGpt] = useState(false);
    const [selectPrompt, setSelectPrompt] = useState<string>('');
    const [prompts, setPrompts] = useState<Prompt[]>([]);

    const models = [
        { label: 'GPT-3.5', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4', value: 'gpt-4' },
    ];
    const [selectedModel, setSelectedModel] = useState<string>(models[0].value);
    const formattedPrompts = prompts.map(prompt => prompt.name); // For SelectDropdown we only need the names


    const savePreferences = async () => {
        try {
            await updatePreference(commonWords, selectedModel, selectPrompt);
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

    const getModelLabel = (modelValue: string) => {
        const model = models.find(item => item.value === modelValue);
        return model ? model.label : "select a model";
    }

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const preferences = await fetchPreferences();
                // setPrompt(preferences.gptPrompt);
                setCommonWords(preferences.commonWords);
                setSelectedModel(preferences.gptModel)
                setSelectPrompt(preferences.defaultPrompt)
                const promptsData = await fetchPrompts();
                setPrompts(promptsData);
            } catch (error) {
                console.error('Failed to fetch preferences:', error);
                // Handle the error, possibly by informing the user about it
            }finally{
                setIsLoading(false);
            }
        };

        loadPreferences();
    }, []);  // The empty dependency array makes sure this effect runs only once, when the component mounts

    if (isLoading) {
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator animating={true} size="large" />
          </View>
        );
      }

    return (
        <TouchableRipple onPress={Keyboard.dismiss} style={{ flex: 1 }}>
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
                <List.Section >
                    <Text style={{ fontWeight: 'bold' }}>GPT Settings</Text>
                    <Paragraph style={styles.helperText}>
                        Select the GPT model you want to use.
                    </Paragraph>
                    <SelectDropdown
                        data={models}
                        onSelect={(selectedItem: Model, index: number) => {
                            setSelectedModel(selectedItem.value);
                        }}
                        buttonTextAfterSelection={(selectedItem: Model, index: number) => {
                            return selectedItem.label;
                        }}
                        rowTextForSelection={(item: Model, index: number) => {
                            return item.label;
                        }}
                        renderCustomizedRowChild={(item: Model, index: number) => {
                            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{item.label}</Text></View>;
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
                        defaultButtonText={getModelLabel(selectedModel)}
                    />
                </List.Section>
                <Divider />
                <List.Section >
                <Text style={{ fontWeight: 'bold' }}>Default Prompt</Text>
                    <Paragraph style={styles.helperText}>
                        Select the prompt as your default prompt.
                    </Paragraph>
                    <SelectDropdown
                        data={formattedPrompts}
                        onSelect={(selectedItem: string, index: number) => {
                            setSelectPrompt(selectedItem);
                        }}
                        buttonTextAfterSelection={(selectedItem: string, index: number) => {
                            return selectedItem;
                        }}
                        rowTextForSelection={(item: string, index: number) => {
                            return item;
                        }}
                        renderCustomizedRowChild={(item: string, index: number) => {
                            return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>{item}</Text></View>;
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
                        defaultButtonText={selectPrompt || "Select a prompt"}
                    />
                </List.Section>
                <Button
                    mode="contained"
                    onPress={savePreferences}
                    // contentStyle={{ height: 50 }}  // adjust this based on your requirement
                    labelStyle={{ color: 'white' }}
                    style={{ position: 'absolute',  bottom:40, alignSelf: 'center', width: '100%'
                }}
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
    commonWordsInput: {
        marginBottom: 10,
        height: windowHeight * 0.25,
        backgroundColor: '#f0f0f0'
    },
    commonWordContainer: {
        height: windowHeight * 0.35,
    },
    gptModel: {
        marginBottom: 10,
        height: windowHeight * 0.4,
        backgroundColor: '#f0f0f0'
    },
    helperText: {
        fontSize: 10,
        color: '#616161', // you can adjust this color
    },
    subheader: {
        fontWeight: 'bold',
    },
});

export default PreferenceScreen;
