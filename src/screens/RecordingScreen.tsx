// RecordingScreen.tsx
import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableWithoutFeedback, Keyboard, Dimensions, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { callGPTAPI } from '../services/callGPTAPI';
import IconButton from '../components/IconButton';
import { useRecording } from '../services/useRecording';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { uploadDataToFirestore, fetchSinglePatientRecord, fetchPrompts, fetchSinglePrompt } from '../services/FirestoreService';
import { TextInput, Button, ActivityIndicator, TouchableRipple, Text, Paragraph, Dialog, Portal, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dropdown } from 'react-native-element-dropdown';
import SelectDropdown from "react-native-select-dropdown";

type RecordingScreenRouteProp = RouteProp<RootStackParamList, 'RecordingScreen'>;

type Props = {
    route: RecordingScreenRouteProp;
};

interface Prompt {
    name: string;
    promptContent: string;
}

const RecordingScreen: React.FC<Props> = ({ route }) => {
    const [patientInfo, setPatientInfo] = useState<string>("");
    const [asrResponse, setAsrResponse] = useState<string>("");
    const [gptResponse, setGptResponse] = useState<string>(""); // Stores the GPT response
    const [isLoading, setIsLoading] = useState<boolean>(false); // Handles loading state
    const [isLoadingData, setIsLoadingData] = useState(true); // Add a new loading state
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [isDropdownFocused, setIsDropdownFocused] = useState(false);

    const formattedPrompts = prompts.map(prompt => prompt.name); // For SelectDropdown we only need the names

    useEffect(() => {
        const fetchUserPrompts = async () => {
            try {
                const promptsData = await fetchPrompts();
                setPrompts(promptsData);
            } catch (error) {
                console.error("Failed to fetch prompts:", error);
            }
        };

        fetchUserPrompts();
    }, []);

    const {
        recording,
        isRecording,
        isPaused,
        counter,
        startRecording,
        stopRecording,
        pauseRecording,
    } = useRecording();

    // Inside your RecordingScreen component, get the item name from route params like so
    const patientId = route.params.name;

    const sendToGPT = async () => {
        setIsLoading(true);
        const selectedPromptData = await fetchSinglePrompt(selectedPrompt)
        try {
            const response = await callGPTAPI(asrResponse, selectedPromptData.promptContent);
            setGptResponse(response);
        } catch (error) {
            console.error("Failed to get response from GPT:", error);
            Alert.alert("Error", "Failed to get response from GPT. Please try again.");
        }
        setIsLoading(false);
    };

    const msToTime = (duration: number) => {
        let seconds: number = Math.floor((duration) % 60)
        let minutes: number = Math.floor((duration / 60) % 60)

        let minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
        let secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();

        return minutesString + ":" + secondsString;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true); // Start loading
                const patientRecord = await fetchSinglePatientRecord(patientId);
                if (patientRecord) {
                    setAsrResponse(patientRecord.asrResponse);
                    setGptResponse(patientRecord.gptResponse);
                    setPatientInfo(patientRecord.patientInfo);
                }
            } catch (error) {
                console.error("Failed to fetch data from Firestore:", error);
            } finally {
                setIsLoadingData(false); // Finish loading
            }
        };

        fetchData();
    }, [patientId]);


    useEffect(() => {
        if (!isLoadingData) { // Only save to AsyncStorage if not loading data
            uploadDataToFirestore(patientId, patientInfo, asrResponse, gptResponse)
        }
    }, [patientInfo, asrResponse, gptResponse, patientId]); // Add isLoadingData to dependencies

    const windowHeight = Dimensions.get('window').height;

    const handleStopRecording = async () => {
        setIsTranscriptLoading(true);
        const transcript = await stopRecording();
        setAsrResponse(prevAsrResponse => `${prevAsrResponse} ${transcript}`);
        setIsTranscriptLoading(false);
    };

    return (
        <SafeAreaView style={{ flex: 1, marginTop: Platform.OS === 'android' ? 24 : 0 }}>
            <TouchableRipple onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                <KeyboardAwareScrollView>
                    <View style={styles.scrollContainer}>
                        <Text style={{ fontSize: 16, marginBottom: 5, textAlign: 'center' }}>Patient ID: {patientId}</Text>
                        <TextInput
                            label="Patient Info"
                            mode="outlined"
                            multiline
                            style={{ height: windowHeight * 0.12, width: '100%', marginBottom: 10 }}
                            placeholder="Enter patient info here"
                            onChangeText={setPatientInfo}
                            value={patientInfo}
                            scrollEnabled
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingRight: 20 }}>
                            <View style={{
                                justifyContent: 'space-between', flex: 0.25, flexDirection: 'row',
                                paddingLeft: 20,
                            }}>
                                {isRecording ? (
                                    <>
                                        <IconButton
                                            onPress={isPaused ? startRecording : pauseRecording}
                                            iconName={isPaused ? "play" : "pause"}
                                        />
                                        <IconButton
                                            onPress={handleStopRecording}
                                            iconName="stop"
                                        />
                                    </>
                                ) : (
                                    <IconButton
                                        onPress={startRecording}
                                        iconName="microphone"
                                    />
                                )}
                            </View>
                            <View style = {{flex: 0.05}}>
                                {isTranscriptLoading && <ActivityIndicator size="small" style={{paddingRight: 10}} />}
                            </View>
                            <View style={{ flex: 0.2 }}>
                                <Text style={{ fontSize: 16, }}>{msToTime(counter)}</Text>
                            </View>
                            <View style={{ flex: 0.4 }}>
                                <SelectDropdown
                                    data={formattedPrompts}
                                    onSelect={(selectedItem, index) => {
                                        setSelectedPrompt(selectedItem);
                                    }}
                                    buttonTextAfterSelection={(selectedItem, index) => {
                                        // text representing selected item
                                        return selectedItem;
                                    }}
                                    rowTextForSelection={(item, index) => {
                                        // text for row
                                        return item;
                                    }}
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
                                    defaultButtonText="select a prompt"
                                />
                            </View>
                        </View>
                        <TextInput
                            label="ASR result"
                            mode="outlined"
                            multiline
                            style={{ height: windowHeight * 0.2, width: '100%', marginTop: 10, marginBottom: 10 }}
                            value={asrResponse}
                            onChangeText={setAsrResponse}
                            placeholder="Start recording to get ASR result"
                            scrollEnabled
                        />
                        <Button mode="contained" onPress={sendToGPT} loading={isLoading}>Send to GPT</Button>
                        <TextInput
                            label="GPT result"
                            mode="outlined"
                            multiline
                            style={{ height: windowHeight * 0.3, width: '100%', marginTop: 10, marginBottom: 20 }}
                            value={gptResponse}
                            onChangeText={setGptResponse}
                            placeholder="Medical note generated by GPT"
                            scrollEnabled
                        />
                        <StatusBar style="auto" />
                    </View>
                </KeyboardAwareScrollView>
            </TouchableRipple>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
        // alignItems: 'center',
    },
    container: {
        backgroundColor: 'white',
        padding: 16,
    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});

export default RecordingScreen;
