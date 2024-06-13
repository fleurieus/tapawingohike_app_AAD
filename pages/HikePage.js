import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const HikePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Hike Page!</Text>
    </View>
  );
};

export default HikePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#bcebdf',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
