import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import defaultImage from '../assets/tapaicon.png'; 

const mockGetRoutePart = async () => {
  return {
    type: 'image', 
    fullscreen: false,
  };
};

const HikePage = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [region, setRegion] = useState(null);
  const [routePart, setRoutePart] = useState(null);
  const endpoint = { latitude: 37.78825, longitude: -122.4324 };

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        const { latitude, longitude } = location.coords;
        console.log('Initial Location:', latitude, longitude);
        setCurrentPosition({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (location) => {
            const { latitude, longitude } = location.coords;
            console.log('Updated Location:', latitude, longitude);
            setCurrentPosition({ latitude, longitude });
            setRegion((prevRegion) => ({
              ...prevRegion,
              latitude,
              longitude,
            }));
          }
        );
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    const fetchRoutePart = async () => {
      try {
        const response = await mockGetRoutePart();
        setRoutePart(response);
      } catch (error) {
        console.error('Error fetching route part:', error);
      }
    };

    getCurrentLocation();
    fetchRoutePart();
  }, []);

  if (!routePart) {
    return <Text>Loading...</Text>;
  }

  if (routePart.type === 'image' && routePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <Image source={defaultImage} style={styles.fullScreenImage} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {routePart.type === 'image' && !routePart.fullscreen && (
        <Image source={defaultImage} style={styles.halfScreenImage} />
      )}
      {region ? (
        <MapView
          style={routePart.type === 'image' && !routePart.fullscreen ? styles.halfScreenMap : styles.map}
          region={region}
          onRegionChangeComplete={(region) => setRegion(region)}
        >
          {currentPosition && (
            <Marker coordinate={currentPosition} title="Current Location">
              <View style={[styles.circle, styles.blueCircle]} />
            </Marker>
          )}
          <Marker coordinate={endpoint} title="Endpoint">
            <View style={[styles.circle, styles.redCircle]} />
          </Marker>
        </MapView>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  halfScreenImage: {
    width: '100%',
    height: '50%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  halfScreenMap: {
    width: '100%',
    height: '50%',
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  redCircle: {
    backgroundColor: 'red',
  },
  blueCircle: {
    backgroundColor: 'blue',
  },
});

export default HikePage;