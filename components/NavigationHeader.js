import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const CustomHeader = ({ navigation }) => {
  const goToInfoPage = () => {
    navigation.navigate('Info');
  };

  const goToSettingsPage = () => {
    // Define navigation to settings page if needed
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={goToInfoPage} style={styles.headerButton}>
        <Text style={styles.buttonText}>Info</Text>
        <FontAwesome name="info-circle" size={20} color="black" style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={goToSettingsPage} style={styles.headerButton}>
        <Text style={styles.buttonText}>Settings</Text>
        <FontAwesome name="cog" size={20} color="black" style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  icon: {
    marginRight: 5,
  },
});

export default CustomHeader;
