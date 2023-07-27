// RecordingScreen.tsx
import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert, TouchableWithoutFeedback, Keyboard, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { callGPTAPI } from '../services/callGPTAPI';
import IconButton from '../components/IconButton';
import { useRecording } from '../services/useRecording';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { uploadDataToFirestore, fetchSinglePatientRecord } from '../services/FirestoreService';
import { TextInput, Button, ActivityIndicator, TouchableRipple, Text, Paragraph, Dialog, Portal, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native';

type RecordingScreenRouteProp = RouteProp<RootStackParamList, 'RecordingScreen'>;

type Props = {
    route: RecordingScreenRouteProp;
};

const RecordingScreen: React.FC<Props> = ({ route }) => {
    const [patientInfo, setPatientInfo] = useState<string>("");
    const [asrResponse, setAsrResponse] = useState<string>("");
    const [gptResponse, setGptResponse] = useState<string>(""); // Stores the GPT response
    const [isLoading, setIsLoading] = useState<boolean>(false); // Handles loading state
    const [isLoadingData, setIsLoadingData] = useState(true); // Add a new loading state
    const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);

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
        try {
            const response = await callGPTAPI(asrResponse);
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
        setAsrResponse(transcript);
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
                            style={{ height: windowHeight * 0.15, width: '100%', marginBottom: 10 }}
                            placeholder="Enter patient info here"
                            onChangeText={setPatientInfo}
                            value={patientInfo}
                            scrollEnabled
                        />
                        <View style={styles.buttonsContainer}>
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
                            {isTranscriptLoading && <ActivityIndicator size="small" style={{ marginRight: 30 }} />}
                            <Text>{msToTime(counter)}</Text>
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
                            style={{ height: windowHeight * 0.25, width: '100%', marginTop: 10, marginBottom: 20 }}
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
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default RecordingScreen;
