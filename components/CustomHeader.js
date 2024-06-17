// CustomHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightButtons}>
        <TouchableOpacity onPress={() => {/* Your custom action */}}>
          <Text style={styles.button}>Button 1</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {/* Your custom action */}}>
          <Text style={styles.button}>Button 2</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    color: 'blue',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  button: {
    marginLeft: 10,
    color: 'blue',
  },
});

export default CustomHeader;
