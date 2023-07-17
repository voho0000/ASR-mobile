import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, ScrollView, Text, Alert, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { callGPTAPI } from '../services/callGPTAPI';
import IconButton from '../components/IconButton';
import { useRecording } from '../services/useRecording';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import sendToServer from '../services/sendToServer';


type RecordingScreenRouteProp = RouteProp<RootStackParamList, 'RecordingScreen'>;

type Props = {
    route: RecordingScreenRouteProp;
};

const RecordingScreen: React.FC<Props> = ({ route }) => {
    const [patientInfo, setPatientInfo] = useState<string>("");
    const [text, setText] = useState<string>("");
    const [gptResponse, setGptResponse] = useState<string>(""); // Stores the GPT response
    const [isLoading, setIsLoading] = useState<boolean>(false); // Handles loading state
    const [isLoadingData, setIsLoadingData] = useState(true); // Add a new loading state


    const {
        recording,
        isRecording,
        isPaused,
        counter,
        startRecording,
        stopRecording,
        pauseRecording,
    } = useRecording(setText);

    // Inside your RecordingScreen component, get the item name from route params like so
    const itemName = route.params.name;

    const sendToGPT = async () => {
        setIsLoading(true);
        try {
            const response = await callGPTAPI(text);
            setGptResponse(response);
        } catch (error) {
            console.error("Failed to get response from GPT:", error);
            Alert.alert("Error", "Failed to get response from GPT. Please try again.");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingData(true); // Start loading
                const storedText = await AsyncStorage.getItem(`text_${itemName}`);
                const storedGptResponse = await AsyncStorage.getItem(`gptResponse_${itemName}`);

                if (storedText !== null) {
                    setText(storedText);
                }

                if (storedGptResponse !== null) {
                    setGptResponse(storedGptResponse);
                }
            } catch (error) {
                console.error("Failed to fetch data from AsyncStorage:", error);
            } finally {
                setIsLoadingData(false); // Finish loading
            }
        };

        fetchData();
    }, [itemName]);


    useEffect(() => {
        if (!isLoadingData) { // Only save to AsyncStorage if not loading data
            AsyncStorage.setItem(`text_${itemName}`, text);
        }
    }, [text, itemName, isLoadingData]); // Add isLoadingData to dependencies

    useEffect(() => {
        if (!isLoadingData) { // Only save to AsyncStorage if not loading data
            AsyncStorage.setItem(`gptResponse_${itemName}`, gptResponse);
        }
    }, [gptResponse, itemName, isLoadingData]); // Add isLoadingData to dependencies


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <TextInput
                        multiline
                        style={styles.textInput}
                        placeholder="Enter patient info here"
                        onChangeText={setPatientInfo} // you need to define this function to update the state
                        value={patientInfo} // and this state to store the patient info
                    />
                    <View style={styles.buttonsContainer}>
                        {isRecording ? (
                            <>
                                <IconButton
                                    onPress={isPaused ? startRecording : pauseRecording}
                                    iconName={isPaused ? "play" : "pause"}
                                    buttonStyle={styles.recordButton}
                                    iconStyle={styles.icon}
                                />
                                <IconButton
                                    onPress={stopRecording}
                                    iconName="stop"
                                    buttonStyle={styles.recordButton}
                                    iconStyle={styles.icon}
                                />
                            </>
                        ) : (
                            <IconButton
                                onPress={startRecording}
                                iconName="microphone"
                                buttonStyle={styles.recordButton}
                                iconStyle={styles.icon}
                            />
                        )}
                        <Text>Record Time: {counter} s</Text>
                    </View>
                    <TextInput
                        multiline
                        style={styles.textInput}
                        onChangeText={setText}
                        value={text}
                        placeholder = "Start recording to get ASR result"
                    />
                    {/* <Button title="Send to GPT" onPress={sendToGPT} disabled={isLoading} /> */}
                    <TouchableOpacity
                        onPress={sendToGPT}
                        style={[styles.button, isLoading ? styles.disabledButton : null]}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Send to GPT</Text>
                        {isLoading && <ActivityIndicator size="small" color="#ffffff" />}
                    </TouchableOpacity>
                    <TextInput
                        multiline
                        style={styles.textInput}
                        value={gptResponse}
                        onChangeText={setGptResponse}
                        placeholder = "GPT response"
                    />
                    <TouchableOpacity
                        onPress={() => sendToServer(gptResponse)}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Send to Server</Text>
                    </TouchableOpacity>
                    <StatusBar style="auto" />
                </ScrollView>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        height: 200,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        marginBottom: 10,
        width: '80%',
        padding: 5
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        margin: 10,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: 'gray', // or another color of your choice
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
    recordButton: {
        backgroundColor: 'red',
        borderRadius: 30,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
    },
    icon: {
        color: 'white',
    },
});

export default RecordingScreen;
