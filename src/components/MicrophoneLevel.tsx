import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

type Props = { level: number | null };

export default function MicrophoneLevel({ level }: Props) {
    const { colors } = useTheme();
    return (
        <View accessibilityRole="progressbar" accessibilityLabel="Microphone input level"
            accessibilityValue={level === null ? { text: 'Input level unavailable' } : { min: 0, max: 100, now: level }}
            style={{ width: 96, minWidth: 24, flexShrink: 1, marginLeft: 8, height: 8,
                borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surfaceVariant }}>
            <View style={{ height: '100%', width: `${level ?? 0}%`, backgroundColor: colors.primary }} />
        </View>
    );
}
