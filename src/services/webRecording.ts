type Options = { deviceId?: string; onLevel?: (level: number | null) => void };

export const startWebRecording = async ({ deviceId = '', onLevel }: Options = {}) => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    });
    let meterContext: AudioContext | undefined;
    let meterTimer: ReturnType<typeof setInterval> | undefined;
    const release = () => {
        clearInterval(meterTimer);
        stream.getTracks().forEach(track => track.stop());
        if (meterContext && meterContext.state !== 'closed') void meterContext.close().catch(() => {});
        onLevel?.(0);
    };
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
        if (onLevel) {
            try {
                const context = new AudioContext();
                meterContext = context;
                const analyser = context.createAnalyser();
                analyser.fftSize = 2048;
                context.createMediaStreamSource(stream).connect(analyser);
                const samples = new Float32Array(analyser.fftSize);
                void context.resume().catch(() => onLevel(null));
                meterTimer = setInterval(() => {
                    if (context.state !== 'running') { onLevel(null); return; }
                    analyser.getFloatTimeDomainData(samples);
                    let energy = 0;
                    for (const sample of samples) energy += sample * sample;
                    onLevel(Math.round(Math.min(1, Math.sqrt(energy / samples.length) * 8) * 100));
                }, 80);
            } catch {
                onLevel(null);
            }
        }
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
