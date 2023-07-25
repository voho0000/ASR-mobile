import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
    title: string;
    onPress: () => void;
  }
  
  const CustomButton = ({ title, onPress }: Props) => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    );
  };

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        margin: 10,
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 12,
    },
});

export default CustomButton;