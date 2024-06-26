import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native'; // Import LottieView

const FinishRoutePartNotification = ({ message, onNextPart, onDismiss }) => {
  return (
    <View style={styles.overlay}>
      <View style={styles.notification}>
        {/* Green Tick Animation */}
        <LottieView
          source={require('../assets/tick.json')} // Adjust the path to your Lottie file
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
        />
        <Text style={styles.message}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onDismiss} style={[styles.button, styles.dismissButton]}>
            <Text style={styles.buttonText}>Sluiten</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNextPart} style={styles.button}>
            <Text style={styles.buttonText}>Volgende</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notification: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  message: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    margin: 5,
  },
  dismissButton: {
    backgroundColor: '#8B0000', // Dark Red color
  },
  buttonText: {
    color: 'white',
  },
});

export default FinishRoutePartNotification;
