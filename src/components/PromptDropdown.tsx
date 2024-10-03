import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import IconButton from './IconButton';
import SelectDropdown from "react-native-select-dropdown";
import { TextInput, Button, Dialog, Portal, ActivityIndicator, HelperText } from 'react-native-paper';
import { updatePrompt, fetchSinglePrompt, fetchPrompts } from '../services/FirestoreService';

interface PromptDropdownProps {
    selectedPrompt: string;
    setSelectedPrompt: (prompt: string) => void;
}

const PromptDropdown: React.FC<PromptDropdownProps> = ({ selectedPrompt, setSelectedPrompt }) => {
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editedPromptContent, setEditedPromptContent] = useState('');
    const [editedPromptName, setEditedPromptName] = useState('');
    const [currentPromptIndex, setCurrentPromptIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [prompts, setPrompts] = useState<string[]>([]);
    const [originalPromptName, setOriginalPromptName] = useState('');
    const [isNameDuplicate, setIsNameDuplicate] = useState(false);
    const [errorText, setErrorText] = useState('');
    const windowHeight = Dimensions.get('window').height;  // 計算屏幕高度

    // 初始化時加載 prompts
    useEffect(() => {
        const loadPrompts = async () => {
            try {
                setIsLoading(true);
                const fetchedPrompts = await fetchPrompts();
                setPrompts(fetchedPrompts.map(prompt => prompt.name));
            } catch (error) {
                console.error('Failed to fetch prompts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPrompts();
    }, []);

    const showEditDialog = async (index: number) => {
        try {
            const selectedPromptName = prompts[index];
            setCurrentPromptIndex(index);
            setOriginalPromptName(selectedPromptName);
            setEditedPromptName(selectedPromptName);
            setIsLoading(true);

            const fetchedPrompt = await fetchSinglePrompt(selectedPromptName);
            setEditedPromptContent(fetchedPrompt.promptContent);

            setEditDialogVisible(true);
        } catch (error) {
            console.error('Failed to fetch prompt data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const hideEditDialog = () => {
        setEditDialogVisible(false);
    };

    const handleSavePrompt = async () => {
        if (currentPromptIndex !== null && !isNameDuplicate && editedPromptName.trim().length <= 20) {
            try {
                setIsLoading(true);
                await updatePrompt(originalPromptName, editedPromptName, editedPromptContent);

                // 更新選中的 prompt
                setSelectedPrompt(editedPromptName);

                // 更新 prompts 列表
                const updatedPrompts = [...prompts];
                updatedPrompts[currentPromptIndex] = editedPromptName;
                setPrompts(updatedPrompts);

                hideEditDialog();
            } catch (error) {
                console.error('Failed to update prompt:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // 檢查 prompt 名稱是否存在並限制字符長度
    const handleSetName = async (text: string) => {
        setEditedPromptName(text);
        if (text.length <= 20) {
            const isDuplicate = prompts.some(prompt => prompt === text && prompt !== originalPromptName);
            if (isDuplicate) {
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

    return (
        <View>
            {isLoading ? (
                <ActivityIndicator animating={true} size="large" />
            ) : (
                <SelectDropdown
                    data={prompts}
                    onSelect={(selectedItem, index) => {
                        setSelectedPrompt(selectedItem);
                    }}
                    buttonTextAfterSelection={(selectedItem) => selectedItem}
                    renderCustomizedRowChild={(item, index) => (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderColor: '#c4c4c4',
                            borderWidth: 1,
                            height: 50,
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                        }}>
                            <Text style={{ color: '#757575', textAlign: 'center' }}>
                                {item}
                            </Text>
                            <IconButton
                                onPress={() => showEditDialog(index)}
                                iconName="pencil"
                                size={20}         
                                marginRight={10}
                            />
                        </View>
                    )}
                    buttonStyle={{
                        width: 160,
                        height: 50,
                        borderColor: '#c4c4c4',
                        borderWidth: 1,
                        borderRadius: 5,
                        justifyContent: 'center',
                    }}
                    buttonTextStyle={{ textAlign: 'center', color: '#757575' }}
                    dropdownStyle={{ marginTop: -30 }}
                    rowStyle={{ borderColor: '#c4c4c4', borderWidth: 1 }}
                    rowTextStyle={{ color: '#757575', textAlign: 'center', paddingLeft: 0 }}
                    defaultButtonText={selectedPrompt || "select a prompt"}
                />
            )}

            {/* 編輯彈窗 */}
            <Portal>
                <Dialog
                    visible={editDialogVisible}
                    onDismiss={hideEditDialog}
                    style={{
                        width: '100%',
                        maxWidth: 1000,
                        alignSelf: 'center',
                    }}
                >
                    <Dialog.Title>Prompt Details</Dialog.Title>
                    <Dialog.Content>
                        {isLoading ? (
                            <ActivityIndicator animating={true} size="large" />
                        ) : (
                            <View>
                                {/* 可修改 Prompt 名稱 */}
                                <TextInput
                                    label="Prompt Name"
                                    value={editedPromptName}
                                    onChangeText={handleSetName}
                                    mode="outlined"
                                    style={{ marginBottom: 10 }}
                                />
                                <HelperText type="error" visible={isNameDuplicate || editedPromptName.length > 20}>
                                    {errorText}
                                </HelperText>

                                {/* 可滾動的多行文本框 */}
                                <TextInput
                                    label="Prompt Content"
                                    multiline
                                    value={editedPromptContent}
                                    onChangeText={setEditedPromptContent}
                                    mode="outlined"
                                    style={{ height: windowHeight * 0.4, marginBottom: 10, width: '100%' }}
                                    scrollEnabled
                                />
                            </View>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideEditDialog}>Cancel</Button>
                        <Button onPress={handleSavePrompt} disabled={isLoading || isNameDuplicate || editedPromptName.length > 20 || editedPromptName.trim() === ''}>
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

export default PromptDropdown;