/*
This component provides navigation controls and contextual options based on the current route. It allows users to navigate back, logout, and optionally proceed to the next route part.
The appearance of the header adjusts dynamically based on the route name, displaying specific actions like undo and next on the 'Hike' route.
FontAwesome icons enhance visual clarity and interaction. Styling ensures consistent alignment and spacing across different screen sizes.
*/

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const CustomHeader = ({ title, onNext, onPrevious, canProceedToNext, backToLogin }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name: routeName } = route;

  const handleBack = () => {
    if (routeName !== 'Login') {
      navigation.goBack();
    }
    backToLogin();
  };

  const handleUndoAction = () => {
    Alert.alert(
      'Confirm',
      'Ga terug naar het vorige route deel?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: onPrevious,
        },
      ],
      { cancelable: true }
    );
  };

  const handleNextAction = () => {
    Alert.alert(
      'Confirm',
      'Ga naar het volgende route deel?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: onNext,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {routeName !== 'Login' && routeName !== 'Info' && (
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>Logout</Text>
        </TouchableOpacity>
      )}
      <View style={styles.titleContainer}>
        <Text style={[ routeName === 'Hike' && styles.titleWithUndoIcon]}>{title}</Text>
      </View>
      {routeName === 'Hike' && (
        <View style={styles.rightContainer}>
          <View style={styles.rightButtons}>
            <TouchableOpacity onPress={handleUndoAction}>
              <FontAwesome name="undo" size={24} color="black" style={styles.icon} />
            </TouchableOpacity>
            {canProceedToNext && (
              <TouchableOpacity onPress={handleNextAction}>
                <FontAwesome name="arrow-right" size={24} color="black" style={styles.icon} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
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
    marginTop: 20,
  },
  backButton: {
    color: 'blue',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 47,
  },
  titleWithUndoIcon: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  icon: {
    marginRight: 5,
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 5,
  },
  disabledButton: {
    color: '#999',
  },
});

export default CustomHeader;
