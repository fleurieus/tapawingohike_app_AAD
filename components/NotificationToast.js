import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

const NotificationToast = ({ message, type, showToast, onHide }) => {
  const backgroundColor = type === 'success' ? 'green' : type === 'error' ? '#8B0000' : 'gray';
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showToast) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timeout = setTimeout(() => {
        onHide();
      }, 2000); // Hide after 2 seconds

      return () => clearTimeout(timeout);
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showToast]);

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity: animation }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NotificationToast;
