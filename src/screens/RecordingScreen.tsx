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
import { uploadDataToFirestore, fetchSinglePatientRecord, fetchPrompts, fetchSinglePrompt, fetchPreferences } from '../services/FirestoreService';
import { TextInput, Button, ActivityIndicator, TouchableRipple, Text, Paragraph, Dialog, Portal, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native';
import SelectDropdown from "react-native-select-dropdown";
import Toast from 'react-native-toast-message';
import { auth } from '../firebaseConfig';

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
    const [isLoadingGpt, setIsLoadingGpt] = useState<boolean>(false); // Handles loading state
    const [isLoading, setIsLoading] = useState(true); // Add a new loading state
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [gptModel, setGptModel] = useState<string>("")
    const [patientId, setPatientId] = useState<string>(""); // Add a new state for patient ID

    const formattedPrompts = prompts.map(prompt => prompt.name); // For SelectDropdown we only need the names
    const oldPatientId = route.params.name;
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                const preferences = await fetchPreferences();
                setGptModel(preferences.gptModel)
                setSelectedPrompt(preferences.defaultPrompt)
            } catch (error) {
                console.error("Failed to fetch prompts:", error);
            }
        };

        fetchUserPreferences();
    }, []);

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

    const sendToGPT = async () => {
        setIsLoadingGpt(true);
        let promptContent = '';
        if (selectedPrompt !== '') {
            const selectedPromptData = await fetchSinglePrompt(selectedPrompt)
            promptContent = selectedPromptData.promptContent
        }
        const preferences = await fetchPreferences()
        try {
            if (userId){
                const response = await callGPTAPI(asrResponse, promptContent, preferences.gptModel, patientId||oldPatientId, userId);
                if (response) {
                    setGptResponse(response);
                    Toast.show({
                        type: 'success',
                        position: 'top',
                        text1: 'Success',
                        text2: 'Successfully get response from GPT.',
                        visibilityTime: 2000,
                        autoHide: true,
                        bottomOffset: 40,
                      });
                }
            }
        } catch (error) {
            console.error("Failed to get response from GPT:", error);
            Alert.alert("Error", "Failed to get response from GPT. Please try again.");
        }
        setIsLoadingGpt(false);
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
                setIsLoading(true); // Start loading
                const patientRecord = await fetchSinglePatientRecord(oldPatientId);
                if (patientRecord) {
                    setAsrResponse(patientRecord.asrResponse);
                    setGptResponse(patientRecord.gptResponse);
                    setPatientInfo(patientRecord.patientInfo);
                }
            } catch (error) {
                console.error("Failed to fetch data from Firestore:", error);
            } finally {
                setIsLoading(false); // Finish loading
                setPatientId(oldPatientId);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading) { // Only save to AsyncStorage if not loading data
            uploadDataToFirestore(oldPatientId, patientId, patientInfo, asrResponse, gptResponse)
        }
    }, [patientInfo, asrResponse, gptResponse, patientId]); // Add isLoadingData to dependencies

    const windowHeight = Dimensions.get('window').height;

    const handleStopRecording = async () => {
        setIsTranscriptLoading(true);
        if (userId) {
            const transcript = await stopRecording(patientId || oldPatientId, userId);
            setAsrResponse(prevAsrResponse => `${prevAsrResponse} ${transcript}`);
            setIsTranscriptLoading(false);
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
        <SafeAreaView style={{ flex: 1, marginTop: Platform.OS === 'android' ? 24 : 0 }}>
            <TouchableRipple onPress={Keyboard.dismiss} style={{ flex: 1 }}>
                <KeyboardAwareScrollView>
                    <View style={styles.scrollContainer}>
                        <TextInput
                            label="Patient ID"
                            mode="outlined"
                            style={{ width: '50%', marginBottom: 10, alignSelf: 'center' }}
                            placeholder="Enter patient ID here"
                            onChangeText={setPatientId}
                            value={patientId}
                        />
                        <TextInput
                            label="Patient Info"
                            mode="outlined"
                            multiline
                            style={{ height: windowHeight * 0.1, width: '100%', marginBottom: 10 }}
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
                            <View style={{ flex: 0.05 }}>
                                {isTranscriptLoading && <ActivityIndicator size="small" style={{ paddingRight: 10 }} />}
                            </View>
                            <View style={{ flex: 0.2 }}>
                                <Text style={{ fontSize: 14, }}>{msToTime(counter)}</Text>
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
                                    defaultButtonText={selectedPrompt || "select a prompt"}
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
                        <Button mode="contained" onPress={sendToGPT} loading={isLoadingGpt}>Send to GPT</Button>
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
