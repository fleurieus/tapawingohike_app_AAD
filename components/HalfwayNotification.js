import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';

const HalfwayNotification = ({ message, onDismiss }) => {
  let sound = useRef(null);

  useEffect(() => {
    // Load and play the sound
    const loadSound = async () => {
      try {
        const { sound: soundObject } = await Audio.Sound.createAsync(
          require('../assets/halfway.mp3')
        );
        sound.current = soundObject;
        await sound.current.playAsync();
      } catch (error) {
        console.log('Error loading sound', error);
      }
    };

    loadSound();

    // Clean up sound when component unmounts
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.overlay}>
      <View style={styles.notification}>
        <LottieView
          source={require('../assets/halfwayStar.json')}
          autoPlay
          loop={false}
          style={styles.lottieAnimation}
        />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={onDismiss} style={styles.button}>
          <Text style={styles.buttonText}>Dismiss</Text>
        </TouchableOpacity>
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
    width: 200,
    height: 200,
  },
  message: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default HalfwayNotification;
