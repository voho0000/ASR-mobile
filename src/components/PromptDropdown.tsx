import React, { useState, useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import IconButton from './IconButton';
import SelectDropdown from "react-native-select-dropdown";
import { TextInput, Button, Dialog, Portal, ActivityIndicator } from 'react-native-paper';
import { updatePrompt, fetchSinglePrompt, fetchPrompts } from '../services/FirestoreService';

interface PromptDropdownProps {
    selectedPrompt: string;
    setSelectedPrompt: (prompt: string) => void;
}

const PromptDropdown: React.FC<PromptDropdownProps> = ({ selectedPrompt, setSelectedPrompt }) => {
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editedPromptContent, setEditedPromptContent] = useState('');
    const [currentPromptIndex, setCurrentPromptIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [prompts, setPrompts] = useState<string[]>([]);
    const [promptName, setPromptName] = useState('');

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
            setPromptName(selectedPromptName);
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
        if (currentPromptIndex !== null) {
            try {
                setIsLoading(true);
                const newPromptName = prompts[currentPromptIndex];
                await updatePrompt(promptName, newPromptName, editedPromptContent);
                
                // 更新選中的 prompt
                setSelectedPrompt(newPromptName);  // 讓 RecordingScreen 更新為最新選中的 prompt

                hideEditDialog();
            } catch (error) {
                console.error('Failed to update prompt:', error);
            } finally {
                setIsLoading(false);
            }
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
                            // paddingRight: 10,
                        }}>
                            <Text style={{ color: '#757575', textAlign: 'center' }}>
                                {item}
                            </Text>
                            <IconButton
                                onPress={() => showEditDialog(index)}
                                iconName="pencil"
                                size={20}         // 調整圖標大小
                                marginRight={10}  // 調整右邊距離
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
                        width: '100%', // 佔滿寬度
                        maxWidth: 1000, // 最大寬度設置為1000
                        alignSelf: 'center',
                    }}
                >
                    <Dialog.Title>Prompt Details</Dialog.Title>
                    <Dialog.Content>
                        {isLoading ? (
                            <ActivityIndicator animating={true} size="large" />
                        ) : (
                            <View>
                                {/* 顯示 Prompt 名稱 */}
                                <TextInput
                                    label="Prompt Name"
                                    value={promptName}
                                    mode="outlined"
                                    disabled={true}
                                    style={{ marginBottom: 10 }}
                                />

                                {/* 可滾動的多行文本框 */}
                                <TextInput
                                    label="Prompt Content"
                                    multiline
                                    value={editedPromptContent}
                                    onChangeText={setEditedPromptContent}
                                    mode="outlined"
                                    style={{ height: 150, marginBottom: 10 }}
                                    scrollEnabled
                                />
                            </View>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideEditDialog}>Cancel</Button>
                        <Button onPress={handleSavePrompt} disabled={isLoading}>
                            Save
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

export default PromptDropdown;