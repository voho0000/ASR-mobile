import Toast from 'react-native-toast-message';

const sendToServer = async (gptResponse: string) => {
    try {
        const response = await fetch('https://yhkuo.com:8000/getMobileResponse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ gptResponse }),
        });

        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }

        const data = await response.json();
        console.log('Response data:', data);

        Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Success',
            text2: 'Successfully sent data to server',
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 40,
        });

        return data;
    } catch (error) {
        Toast.show({
            type: 'error',
            position: 'top',
            text1: 'Error',
            text2: 'Failed to send data to server',
            visibilityTime: 2000,
            autoHide: true,
            bottomOffset: 40,
        });

        console.error('Failed to send data:', error);
        return null;
    }
};

export default sendToServer;
