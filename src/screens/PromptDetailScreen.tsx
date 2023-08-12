import React, { useState, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { addPrompt, updatePrompt, fetchSinglePrompt, fetchPrompts } from '../services/FirestoreService';

type PromptDetailScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'PromptDetailScreen'
>;

type PromptDetailScreenRouteProp = RouteProp<RootStackParamList, 'PromptDetailScreen'>;

type Props = {
    navigation: PromptDetailScreenNavigationProp;
    route: PromptDetailScreenRouteProp;
};

const PromptDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const isNew = route.params.isNew
    const promptName = route.params.name
    const [isNameDuplicate, setIsNameDuplicate] = useState(false);
    const [errorText, setErrorText] = useState('');

    useEffect(() => {
        if (!isNew && promptName) {
            fetchSinglePrompt(promptName).then((prompt) => {
                setIsLoading(false);
                setName(prompt.name);
                setContent(prompt.promptContent);
            });
        } else {
            setIsLoading(false);
        }
    }, [isNew, promptName]);

    const handleSave = async () => {
        if (route.params.isNew) {
            await addPrompt(name, content);
        } else {
            if (promptName) {
                await updatePrompt(promptName, name, content);
            }
        }
        navigation.goBack();
    };

    const checkPromptExists = async (name: string): Promise<boolean> => {
        try {
            const prompts = await fetchPrompts();
            return prompts.some(prompt => prompt.name === name);
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleSetName = async (text: string) => {
        setName(text);
        if (text.length <= 20) {
            if (await checkPromptExists(text)) {
                setIsNameDuplicate(true);
                setErrorText('This prompt name already exists. Please choose a different name.');
            } else {
                setIsNameDuplicate(false);
                setErrorText('');
            }
        } else {
            setErrorText('Prompt name cannot exceed 20 characters.');
        }
    };
    


    const windowHeight = Dimensions.get('window').height;

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView>
            <View style={{
                flex: 1, justifyContent: 'center', padding: 20, width: '100%', maxWidth: 1000, alignSelf: 'center'
            }}>
                <TextInput
                    label="Prompt name"
                    value={name}
                    onChangeText={handleSetName}
                    mode="outlined"
                    style={{ marginBottom: 10 }}
                />
                <TextInput
                    label="Prompt content"
                    multiline
                    value={content}
                    onChangeText={setContent}
                    mode="outlined"
                    style={{ height: windowHeight * 0.4, width: '100%', marginBottom: 10 }}
                />
                <HelperText type="error" visible={isNameDuplicate|| name.length > 20}>
                    {errorText}
                </HelperText>
                <Button mode="contained" onPress={handleSave} disabled={isNameDuplicate || name.trim() === '' || name.length > 20}>
                    Save
                </Button>
            </View>
        </KeyboardAwareScrollView>
    );
};

export default PromptDetailScreen;
