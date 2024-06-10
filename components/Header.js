import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/tapaicon.png')}
        style={styles.image}
        testID="logo-image"
      />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Tapawingo</Text>
        <Text style={styles.subtitle}>Hike app</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#000000',
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 10,
    paddingLeft: 10,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    marginLeft: 20,
  },
});

export default Header;
