export const startWebRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const release = () => stream.getTracks().forEach(track => track.stop());
    try {
        const mimeType = ['audio/webm;codecs=opus', 'audio/mp4']
            .find(type => MediaRecorder.isTypeSupported(type));
        if (!mimeType) throw new Error('This browser does not support audio recording.');
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];
        const completed = new Promise<Blob>((resolve, reject) => {
            recorder.ondataavailable = event => {
                if (event.data.size) chunks.push(event.data);
            };
            recorder.onerror = () => {
                release();
                reject(new Error('Failed to record audio. Please try again.'));
            };
            recorder.onstop = () => {
                release();
                const blob = new Blob(chunks, { type: recorder.mimeType });
                if (blob.size) resolve(blob);
                else reject(new Error('No audio was recorded. Check the microphone input.'));
            };
        });
        // Errors can occur before the user presses stop; stop still receives them.
        void completed.catch(() => {});
        recorder.start();
        return {
            stop: () => {
                if (recorder.state !== 'inactive') recorder.stop();
                return completed;
            },
            cancel: () => {
                if (recorder.state !== 'inactive') recorder.stop();
                release();
            },
        };
    } catch (error) {
        release();
        throw error;
    }
};
