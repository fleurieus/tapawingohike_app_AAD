import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const RouteCompletionComponent = () => {
  const navigation = useNavigation();

  const handleBackToLogin = () => {
    navigation.navigate('Login'); // Replace 'Login' with your actual login screen route name
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.completionText}>Gefeliciteerd!</Text>
        <Text style={styles.completionText}>Je hebt de route voltooid.</Text>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.button}>
          <Text style={styles.buttonText}>Terug naar Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bcebdf',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    width: '80%',
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default RouteCompletionComponent;
