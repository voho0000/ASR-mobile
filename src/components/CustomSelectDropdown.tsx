import React from 'react';
import SelectDropdown from 'react-native-select-dropdown';
import { View, Text } from 'react-native';

// Define the generic type T to make the component more flexible
interface CustomSelectDropdownProps<T> {
    data: T[];
    selectedItem?: T;
    setSelectedItem: (item: T) => void;
    getItemLabel: (item: T) => string;
    defaultButtonText?: string; // Optional for setting default text when no item is selected
}

const CustomSelectDropdown = <T extends unknown>({
    data,
    selectedItem,
    setSelectedItem,
    getItemLabel,
    defaultButtonText = 'Select an option', // Set default text here if none provided
}: CustomSelectDropdownProps<T>) => {
    return (
        <SelectDropdown
            data={data}
            onSelect={(selectedItem, index) => {
                setSelectedItem(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem) => {
                return getItemLabel(selectedItem);
            }}
            rowTextForSelection={(item) => {
                return getItemLabel(item);
            }}
            renderCustomizedRowChild={(item, index) => (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 15, // Adjusted for consistent height
                    paddingHorizontal: 10,
                }}>
                    <Text>{getItemLabel(item)}</Text>
                </View>
            )}
            buttonStyle={{
                width: '100%',
                height: 50,
                borderColor: '#c4c4c4',
                borderWidth: 1,
                borderRadius: 5,
                justifyContent: 'flex-start',
                paddingHorizontal: 10,
                backgroundColor: '#fff',
                marginTop: 10,
                marginBottom: 10,
            }}
            buttonTextStyle={{ textAlign: 'center', color: '#000000' }}
            dropdownStyle={{
                marginTop: -30,
                borderColor: '#c4c4c4',
                borderWidth: 1,
                borderRadius: 5,
                backgroundColor: '#fff'
            }}
            rowStyle={{
                height: 50,  // Set row height here to enforce 50
                borderBottomWidth: 1,
                borderBottomColor: '#c4c4c4',
                justifyContent: 'center',
            }}
            rowTextStyle={{ textAlign: 'center', color: '#000000' }}
            defaultButtonText={selectedItem ? getItemLabel(selectedItem) : defaultButtonText} // Show selected item label or default text
        />
    );
};

export default CustomSelectDropdown;