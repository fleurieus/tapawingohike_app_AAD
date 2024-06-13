import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const InfoPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Info Page. Here you can find out how the app works.</Text>
    </View>
  );
};

export default InfoPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bcebdf',
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
});
