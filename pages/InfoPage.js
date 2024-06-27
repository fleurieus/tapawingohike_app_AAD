
/*
This page provides instructional information on how to use the app. It includes explanations and visual aids such as images and icons to guide users through how to use the app.
*/

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import Header from '../components/Header';

const InfoPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Header />
          <View style={styles.header}>
            <Text style={styles.headerText}>Hoe werkt de app?</Text>
          </View>
          <Text style={styles.text}>
            Volg de route naar het eind punt.{"\n"}
            De rode marker op het map is je doel.
          </Text>
          <View style={styles.circleContainer}>
            <Image 
              source={require('../assets/redMarker.jpg')} 
              style={styles.redMarkerImage} 
            />
          </View>
          <Text style={styles.text}>
            De blauwe circle geeft je huidige locatie aan.
          </Text>
          <View style={[styles.circle, styles.blueCircle]}></View>
          <Text style={styles.text}>Sommige routes hebben plaatjes en/of audio.</Text>
          <View style={styles.iconRow}>
            <FontAwesome5 name="image" size={16} color="black" style={styles.icon} />
            <Text style={styles.text}>Plaatjes laten onderdelen van de route zien - zoek deze!</Text>
          </View>
          <View style={styles.iconRow}>
            <FontAwesome5 name="volume-up" size={16} color="black" style={styles.icon} />
            <Text style={styles.text}>Luister naar de audio voor tips en info over de route.</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <FontAwesome name="arrow-left" size={20} color="black" />
            <Text style={styles.buttonText}>TERUG NAAR LOGIN</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </View>
  );
};

export default InfoPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bcebdf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  redMarkerImage: {
    width: 50,
    height: 50,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  blueCircle: {
    backgroundColor: 'blue',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
});
