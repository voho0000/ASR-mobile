// // IconButton.tsx

// import React from 'react';
// import { TouchableOpacity, View, TextStyle, StyleSheet  } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';

// interface IconButtonProps {
//   onPress: () => void;
//   iconName: string;
//   buttonStyle?: View['props']['style'];
//   iconStyle?: TextStyle;
// }

// const IconButton: React.FC<IconButtonProps> = ({ onPress, iconName}) => {
//   return (
//     <TouchableOpacity onPress={onPress} style={styles.recordButton}>
//       <Icon name={iconName} size={30} color="white" style={styles.icon} />
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   recordButton: {
//     backgroundColor: 'red',
//     borderRadius: 30,
//     width: 50,
//     height: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     margin: 0,
//     marginRight: 20,
// },
// icon: {
//     color: 'white',
// },
// });

// export default IconButton;

import React from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface IconButtonProps {
  onPress: () => void;
  iconName: string;
  size?: number; // 新增 size prop，默認值為 35
  marginRight?: number; // 新增 marginRight prop，默認值為 20
}

const IconButton: React.FC<IconButtonProps> = ({ onPress, iconName, size = 35, marginRight = 20 }) => {
  return (
    <Pressable onPress={onPress}>
      <Icon name={iconName} size={size} color="gray" style={{ marginRight }} />
    </Pressable>
  );
};

export default IconButton;