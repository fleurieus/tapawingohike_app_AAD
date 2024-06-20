import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RouteCompletionComponent = () => {
  const navigation = useNavigation();

  const handleBackToLogin = () => {
    navigation.navigate('Login'); /// Replace 'Login' with your actual login screen route name
  };

  return (
    <View style={styles.fullScreenContainer}>
      <Text style={styles.completionText}>Congratulations! You have completed the route.</Text>
      <TouchableOpacity onPress={handleBackToLogin} style={styles.button}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default RouteCompletionComponent;
