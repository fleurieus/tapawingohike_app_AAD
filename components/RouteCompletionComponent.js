import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';

const RouteCompletionComponent = ({ onBackToPrevious }) => {
  const navigation = useNavigation();
  const confettiRef = useRef(null);

  const handleBackToLogin = () => {
    navigation.navigate('Login'); // Replace 'Login' with your actual login screen route name
  };

  const triggerConfetti = () => {
    if (confettiRef.current) {
      // Trigger confetti animation
      confettiRef.current.start();
    }
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.completionText}>Gefeliciteerd!</Text>
        <Text style={styles.completionText}>Je hebt de route voltooid.</Text>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.button}>
          <Text style={styles.buttonText}>Terug naar Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onBackToPrevious} style={styles.button}>
          <Text style={styles.buttonText}>Terug naar vorige deel</Text>
        </TouchableOpacity>
      </View>
      {/* Render ConfettiCannon component with a ref */}
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
      />
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
