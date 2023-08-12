import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, List, Dialog, Portal, Paragraph, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { fetchPrompts, deletePrompt } from '../services/FirestoreService';

type PromptListScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'PromptListScreen'
>;

interface Prompt {
    name: string;
    promptContent: string;
}

const PromptListScreen = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // new state for the selected index
    const [visible, setVisible] = useState(false);
    const navigation = useNavigation<PromptListScreenNavigationProp>();
    const isFocused = useIsFocused();

    const showDialog = () => setVisible(true);

    const hideDialog = () => setVisible(false);

    useEffect(() => {
        const fetchAllPrompts = async () => {
            try {
                const promptData = await fetchPrompts();
                setIsLoading(false);
                setPrompts(promptData);

            } catch (error) {
                console.error("Failed to fetch data from Firestore:", error);
            } finally {
                setIsLoading(false); // Finish loading
            }
        };
        fetchAllPrompts();
        // console.log(prompts)
    }, [isFocused]);

    const handlePressAddPrompt = () => {
        navigation.navigate('PromptDetailScreen', { name: '', isNew: true });
    };

    const handlePressItem = (itemName: string) => {
        navigation.navigate('PromptDetailScreen', { name: itemName, isNew: false });
    };

    const handleDelete = async () => {
        if (selectedIndex !== null) { // ensure selectedIndex is set
            const promptId = prompts[selectedIndex].name;
            try {
                // delete the prompt from Firestore
                await deletePrompt(promptId);
                // re-fetch the prompts
                const promptData = await fetchPrompts();
                setPrompts(promptData);
            } catch (error) {
                console.error("Failed to delete item:", error);
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
        <View style={styles.container}>
            <FlatList
                data={prompts}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }: { item: Prompt; index: number }) => (
                    <List.Item
                        title={item.name}
                        description={item.promptContent}
                        descriptionNumberOfLines={2} // limit the number of lines for description
                        descriptionStyle={{ fontSize: 12, overflow: 'hidden' }} // hide overflowing text
                        style={{ paddingVertical: 0 }} // enforce a consistent height and remove vertical padding
                        onPress={() => handlePressItem(item.name)}
                        right={() =>
                            <IconButton
                                icon="delete"
                                size={30}
                                onPress={() => {
                                    setSelectedIndex(index);
                                    showDialog();
                                }}
                            />
                        }
                    />
                )}
                ItemSeparatorComponent={() => <Divider />}
            />
            <Dialog visible={visible} onDismiss={hideDialog}>
                <Dialog.Title>Confirm deletion</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>Are you sure you want to delete this prompt?</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={hideDialog}>Cancel</Button>
                    <Button onPress={() => { handleDelete(); hideDialog(); }}>Confirm</Button>
                </Dialog.Actions>
            </Dialog>
            <Button mode="contained" onPress={handlePressAddPrompt}>Add a Prompt</Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
        width:'100%', 
        maxWidth:1000, 
        alignSelf:'center'
    },
});

export default PromptListScreen;
