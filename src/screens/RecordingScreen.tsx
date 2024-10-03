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
import PromptDropdown from '../components/PromptDropdown';  // 引入 PromptDropdown 組件

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
    // const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [gptModel, setGptModel] = useState<string>("")
    const windowHeight = Dimensions.get('window').height;
    const [infoInputHeight, setInfoInputHeight] = useState<number>(40);
    const [asrInputHeight, setAsrInputHeight] = useState<number>(80);
    const [gptInputHeight, setGptInputHeight] = useState<number>(80);


    // const formattedPrompts = prompts.map(prompt => prompt.name); // For SelectDropdown we only need the names
    const patientId = route.params.name;
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

    // useEffect(() => {
    //     const fetchUserPrompts = async () => {
    //         try {
    //             const promptsData = await fetchPrompts();
    //             setPrompts(promptsData);
    //         } catch (error) {
    //             console.error("Failed to fetch prompts:", error);
    //         }
    //     };

    //     fetchUserPrompts();
    // }, []);

    const {
        isRecording,
        counter,
        startRecording,
        stopRecording,
    } = useRecording();

    // Stop recording when the component is unmounted
    useEffect(() => {
        return () => {
            if (isRecording) {
                stopRecording(false);  // Stop recording if the user leaves the screen
            }
        };
    }, [isRecording]);

    const sendToGPT = async () => {
        setIsLoadingGpt(true);
        let promptContent = '';
        if (selectedPrompt !== '') {
            const selectedPromptData = await fetchSinglePrompt(selectedPrompt)
            promptContent = selectedPromptData.promptContent
        }
        const preferences = await fetchPreferences()
        try {
            const response = await callGPTAPI(asrResponse, promptContent, preferences.gptModel);
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
                const patientRecord = await fetchSinglePatientRecord(patientId);
                if (patientRecord) {
                    setAsrResponse(patientRecord.asrResponse);
                    setGptResponse(patientRecord.gptResponse);
                    setPatientInfo(patientRecord.patientInfo);
                }
            } catch (error) {
                console.error("Failed to fetch data from Firestore:", error);
            } finally {
                setIsLoading(false); // Finish loading
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading) { // Only save to AsyncStorage if not loading data
            const currentDate = new Date(); // get local date
            uploadDataToFirestore(patientId, patientInfo, asrResponse, gptResponse, currentDate)
        }
    }, [patientInfo, asrResponse, gptResponse, patientId]); // Add isLoadingData to dependencies


    const handleStopRecording = async () => {
        setIsTranscriptLoading(true);
        const transcript = await stopRecording();
        setAsrResponse(prevAsrResponse => `${prevAsrResponse} ${transcript}`);
        setIsTranscriptLoading(false);
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
            <KeyboardAwareScrollView>
                <View style={styles.scrollContainer}>
                    <View style={{ width: '50%', marginBottom: 10, alignSelf: 'center', padding: 10, borderWidth: 1, borderColor: '#c4c4c4', borderRadius: 5 }}>
                        <Text style={{ fontSize: 16 }}>{patientId}</Text>
                    </View>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Patient Info</Text>
                    <TextInput
                        // label="Patient Info"
                        mode="outlined"
                        multiline
                        onContentSizeChange={(e) => {
                            setInfoInputHeight(e.nativeEvent.contentSize.height);
                        }}
                        style={{
                            height: infoInputHeight, // +40 need to be removed for web version
                            minHeight: windowHeight * 0.1,
                            maxWidth: 1000,
                            alignSelf: 'center',
                            width: '100%',
                            marginBottom: 10
                        }}
                        placeholder="Enter patient info here"
                        onChangeText={setPatientInfo}
                        value={patientInfo}
                        scrollEnabled
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingRight: 20 }}>
                        <View style={{
                            justifyContent: 'center', flex: 0.2, flexDirection: 'row',
                            paddingLeft: 20,
                        }}>
                            {isRecording ? (
                                <IconButton
                                    onPress={handleStopRecording}
                                    iconName="stop"
                                />
                            ) : (
                                <IconButton
                                    onPress={startRecording}
                                    iconName="microphone"
                                />
                            )}
                        </View>
                        <View style={{ flex: 0.1 }}>
                            {isTranscriptLoading && <ActivityIndicator size="small" style={{ paddingRight: 10 }} />}
                        </View>
                        <View style={{ flex: 0.2 }}>
                            <Text style={{ fontSize: 14, }}>{msToTime(counter)}</Text>
                        </View>
                        <View style={{ flex: 0.4 }}>
                            <PromptDropdown
                                selectedPrompt={selectedPrompt}
                                setSelectedPrompt={setSelectedPrompt}
                            />
                        </View>
                    </View>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10, }}>ASR result</Text>
                    <TextInput
                        // label="ASR result"
                        mode="outlined"
                        multiline
                        onContentSizeChange={(e) => {
                            setAsrInputHeight(e.nativeEvent.contentSize.height);
                        }}
                        style={{
                            height: asrInputHeight, // +40 need to be removed for web version
                            minHeight: windowHeight * 0.2,
                            maxWidth: 1000,
                            alignSelf: 'center',
                            width: '100%',
                            marginBottom: 10
                        }}
                        value={asrResponse}
                        onChangeText={setAsrResponse}
                        placeholder="Start recording to get ASR result"
                    // scrollEnabled
                    />
                    <Button mode="contained" onPress={sendToGPT} loading={isLoadingGpt}>Send to GPT</Button>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: 10, }}>GPT result</Text>
                    <TextInput
                        // label="GPT result"
                        mode="outlined"
                        multiline
                        onContentSizeChange={(e) => {
                            setGptInputHeight(e.nativeEvent.contentSize.height);
                        }}
                        style={{
                            height: gptInputHeight, // +40 need to be removed for web version
                            minHeight: windowHeight * 0.2,
                            maxWidth: 1000,
                            alignSelf: 'center',
                            width: '100%',
                            marginBottom: 20
                        }}
                        value={gptResponse}
                        onChangeText={setGptResponse}
                        placeholder="Medical note generated by GPT"
                    // scrollEnabled={false}
                    // scrollEnabled
                    />
                    <StatusBar style="auto" />
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        maxWidth: 1000,
        // alignItems: 'center', 
        alignSelf: 'center',
        width: '100%'
        // alignContent: 'center',
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

// Separate styles for web
const webStyles = StyleSheet.create({
    scrollContainer: {
        ...styles.scrollContainer,
        padding: 20,
        maxWidth: 800,  // Set max width for web container
        marginHorizontal: 'auto'  // Center the container on the web
    }
});

export default RecordingScreen;
