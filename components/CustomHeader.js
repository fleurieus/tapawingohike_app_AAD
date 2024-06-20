import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const CustomHeader = ({ title }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name: routeName } = route;

  // Function to handle pressing the back button
  const handleBack = () => {
    if (routeName !== 'Login') {
      navigation.goBack();
    }
    // Handle other cases if needed
  };

  // Function to handle undo action
  const handleUndoAction = () => {
    Alert.alert(
      'Confirm',
      'Ga terug naar de vorige route deel?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            // Handle the undo action here
            console.log('Undo action confirmed');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to handle next action
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
          onPress: () => {
            // Handle the next action here
            console.log('Next action confirmed');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Function to render right buttons based on route name
  const renderRightButtons = () => {
    switch (routeName) {
      case 'Hike':
        return (
          <View style={styles.rightButtons}>
            <TouchableOpacity onPress={handleUndoAction}>
              <FontAwesome name="undo" size={24} color="black" style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextAction}>
              <FontAwesome name="arrow-right" size={24} color="black" style={styles.icon} />
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Conditionally render the back button */}
      {routeName !== 'Login' && routeName !== 'Info' && (
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>Terug</Text>
        </TouchableOpacity>
      )}
      {/* Centered title */}
      <Text style={styles.title}>{title}</Text>
      {/* Render right buttons based on route name */}
      {renderRightButtons()}
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
    marginTop: 20
  },
  backButton: {
    color: 'blue',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
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
});

export default CustomHeader;
