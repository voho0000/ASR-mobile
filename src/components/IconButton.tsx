// IconButton.tsx

import React from 'react';
import { TouchableOpacity, View, TextStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IconButtonProps {
  onPress: () => void;
  iconName: string;
  buttonStyle?: View['props']['style'];
  iconStyle?: TextStyle;
}

const IconButton: React.FC<IconButtonProps> = ({ onPress, iconName, buttonStyle, iconStyle }) => {
  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle}>
      <Icon name={iconName} size={30} color="white" style={iconStyle} />
    </TouchableOpacity>
  );
};

export default IconButton;
