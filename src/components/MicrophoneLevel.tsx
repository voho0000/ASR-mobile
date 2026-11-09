import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type Props = { level: number | null; recording: boolean; inputLabel: string };

export default function MicrophoneLevel({ level, recording, inputLabel }: Props) {
    const { colors } = useTheme();
    const value = recording && level !== null ? level : 0;
    const status = !recording ? 'Ready to record' : level === null ? 'Input level unavailable' : 'Listening';
    return (
        <View style={{ marginVertical: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text>Microphone input</Text>
                <Text>{status}</Text>
            </View>
            <View accessibilityRole="progressbar" accessibilityLabel="Microphone input level"
                accessibilityValue={{ min: 0, max: 100, now: value }}
                style={{ height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: colors.surfaceVariant }}>
                <View style={{ height: '100%', width: `${value}%`, backgroundColor: colors.primary }} />
            </View>
            <Text style={{ marginTop: 6 }}>
                {recording ? 'Recording input' : 'Microphone'}: {inputLabel}
            </Text>
        </View>
    );
}
