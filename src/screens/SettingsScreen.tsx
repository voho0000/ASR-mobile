import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useNavigation } from '@react-navigation/native';
import { Button, Dialog, Portal, Paragraph, List, Divider } from 'react-native-paper';
import { logout } from '../services/auth';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'SettingsScreen'
>;

type Props = {
    navigation: SettingsScreenNavigationProp;
};

const SettingsScreen: React.FC<Props> = ({ }) => {
    const [logoutVisible, setLogoutVisible] = React.useState(false);
    const showLogoutDialog = () => setLogoutVisible(true);
    const hideLogoutDialog = () => setLogoutVisible(false);

    const navigation = useNavigation<SettingsScreenNavigationProp>();

    return (
        <View style={styles.container}>
            <List.Section>
                <Divider />
                <List.Item
                    title="Profile"
                    left={() => <List.Icon icon="account" />}
                    onPress={() => navigation.navigate('ProfileScreen')}
                    style={{paddingTop: 20, paddingBottom: 20 }}
                />
                <Divider />
                <List.Item
                    title="Preferences"
                    left={() => <List.Icon icon="cog" />}
                    onPress={() => navigation.navigate('PreferenceScreen')}
                    style={{paddingTop: 20, paddingBottom: 20 }}
                />
                <Divider />
            </List.Section>

            <View style={styles.logoutContainer}>
                <Button mode="outlined" onPress={showLogoutDialog}>Log Out</Button>
            </View>

            <Portal>
                <Dialog visible={logoutVisible} onDismiss={hideLogoutDialog}>
                    <Dialog.Title>Log Out</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Are you sure you want to log out?</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={hideLogoutDialog}>No</Button>
                        <Button onPress={() => {
                            hideLogoutDialog();
                            logout().then(() => navigation.replace('LoginScreen'));
                        }}>Yes</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
    },
    logoutContainer: {
        marginBottom: 16,
    },
});

export default SettingsScreen;
