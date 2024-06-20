import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import LocationUtils from '../utils/LocationUtils.js';
import defaultImage from '../assets/tapaicon.png';

const mockGetRoutePart = async () => {
  return {
    type: 'image', // or 'image' or 'map' or 'audio'
    fullscreen: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Example audio URL
    radius: 25
  };
};

const HikePage = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [region, setRegion] = useState(null);
  const [routePart, setRoutePart] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const endpoint = { latitude: 37.421956, longitude: -122.084040};

  //37.421956, -122.084040 default google location

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
            timeInterval: 10000,
            distanceInterval: 0,
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

            // Calculate distance to endpoint and log it
            const distance = LocationUtils.calculateDistance(latitude, longitude, endpoint.latitude, endpoint.longitude);
            console.log('Distance to endpoint in meters:', distance);

            if (distance < routePart.radius) {
              console.log('destination reached');
            }
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
        if (response.type === 'audio') {
          const { sound } = await Audio.Sound.createAsync({ uri: response.audioUrl });
          setSound(sound);
        }
      } catch (error) {
        console.error('Error fetching route part:', error);
      }
    };

    getCurrentLocation();
    fetchRoutePart();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playPauseAudio = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const rewindAudio = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.max(0, status.positionMillis - 10000); // Rewind 10 seconds
      await sound.setPositionAsync(newPosition);
    }
  };

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

  if (routePart.type === 'audio' && routePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.audioPlayerContainer}>
          <Text>Playing Audio...</Text>
          <TouchableOpacity onPress={playPauseAudio} style={styles.controlButton}>
            <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rewindAudio} style={styles.controlButton}>
            <Text>Rewind</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (routePart.type === 'map' && routePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <MapView
          style={styles.fullScreenMap}
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {routePart.type === 'image' && !routePart.fullscreen && (
        <Image source={defaultImage} style={styles.halfScreenImage} />
      )}
      {routePart.type === 'audio' && !routePart.fullscreen && (
        <View style={styles.halfScreenAudio}>
          <Text>Playing Audio...</Text>
          <TouchableOpacity onPress={playPauseAudio} style={styles.controlButton}>
            <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={rewindAudio} style={styles.controlButton}>
            <Text>Rewind</Text>
          </TouchableOpacity>
        </View>
      )}
      {region && !routePart.fullscreen && (
        <MapView
          style={styles.halfScreenMap}
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
      )}
      {!region && !routePart.fullscreen && (
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  halfScreenImage: {
    width: '100%',
    height: '50%',
  },
  halfScreenAudio: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfScreenMap: {
    width: '100%',
    height: '50%', // Adjusted map height for half screen
  },
  fullScreenMap: {
    ...StyleSheet.absoluteFillObject, // Covering the entire screen
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
  audioPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
});

export default HikePage;
