const storageKey = 'asr.microphone';
const defaultMicrophone = { deviceId: '', label: 'Use browser default microphone' };

export const readMicrophonePreference = () => {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (typeof value === 'object' && value !== null &&
            'deviceId' in value && typeof value.deviceId === 'string' &&
            'label' in value && typeof value.label === 'string') {
            return { deviceId: value.deviceId, label: value.label };
        }
    } catch {
        // Storage can be unavailable in a restricted browser session.
    }
    return defaultMicrophone;
};

export const saveMicrophonePreference = (microphone: typeof defaultMicrophone) => {
    localStorage.setItem(storageKey, JSON.stringify(microphone));
};
