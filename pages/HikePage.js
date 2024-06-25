import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import LocationUtils from '../utils/LocationUtils.js';
import defaultImage from '../assets/tapaicon.png';
import FinishRoutePartNotification from '../components/FinishRoutePartNotification';
import RouteCompletionComponent from '../components/RouteCompletionComponent';

const routeParts = [
  {
    type: 'image',
    fullscreen: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    radius: 25,
    endpoint: { latitude: 37.421956, longitude: -122.084040 },
  },
  {
    type: 'audio',
    fullscreen: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    radius: 25,
    endpoint: { latitude: 37.422000, longitude: -122.085000 },
  },
  {
    type: 'map',
    fullscreen: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    radius: 25,
    endpoint: { latitude: 37.422000, longitude: -122.085000 },
  },
];

const dynamicBorderRadius = 10; 

const HikePage = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [region, setRegion] = useState(null);
  const [currentRoutePartIndex, setCurrentRoutePartIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [routeCompleted, setRouteCompleted] = useState(false);

  const currentRoutePart = routeParts[currentRoutePartIndex];

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

      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    const setupLocationWatcher = async () => {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 15000,
          distanceInterval: 0,
        },
        (location) => {
          const { latitude, longitude, accuracy } = location.coords;
          console.log('Updated Location:', latitude, longitude);
          console.log('Location Accuracy:', accuracy);
          // dynamicBorderRadius = Math.floor(accuracy);
          setCurrentPosition({ latitude, longitude });
          setRegion((prevRegion) => ({
            ...prevRegion,
            latitude,
            longitude,
          }));
    
          if (currentRoutePart) {
            const distance = LocationUtils.calculateDistance(
              latitude,
              longitude,
              currentRoutePart.endpoint.latitude,
              currentRoutePart.endpoint.longitude
            );
            console.log('Distance to endpoint in meters:', distance);
    
            if (distance <= currentRoutePart.radius) {
              console.log('Destination reached, showing notification');
              setShowNotification(true);
            }
          } else {
            console.log('Error fetching route part');
          }
        }
      );
    };

    const initialize = async () => {
      await getCurrentLocation();
      await setupLocationWatcher();
      if (routeParts.length > 0 && routeParts[0].type === 'audio') {
        const { sound } = await Audio.Sound.createAsync({ uri: routeParts[0].audioUrl });
        setSound(sound);
      }
    };

    initialize();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (currentRoutePart && currentRoutePart.type === 'audio') {
      const loadAudio = async () => {
        const { sound } = await Audio.Sound.createAsync({ uri: currentRoutePart.audioUrl });
        setSound(sound);
      };
      loadAudio();
    }
  }, [currentRoutePart]);

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

  const stopAudio = async () => {
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(!isPlaying);
    }
};
  

  const rewindAudio = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.max(0, status.positionMillis - 10000);
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleNextPart = () => {
    console.log('Proceeding to the next part of the route');
    setShowNotification(false);
    if (currentRoutePartIndex < routeParts.length - 1) {
      setCurrentRoutePartIndex((prevIndex) => prevIndex + 1);
    } else {
      setRouteCompleted(true);
    }
    stopAudio();
  };

  const centerOnCurrentLocation = () => {
    if (currentPosition) {
      setRegion({
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  if (routeCompleted) {
    return <RouteCompletionComponent />;
  }

  if (!currentRoutePart) {
    return <Text>Loading...</Text>;
  }

  if (currentRoutePart.type === 'image' && currentRoutePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <Image source={defaultImage} style={styles.fullScreenImage} />
        {showNotification && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            style={styles.notification}
          />
        )}
      </View>
    );
  }

  if (currentRoutePart.type === 'audio' && currentRoutePart.fullscreen) {
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
        {showNotification && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            style={styles.notification}
          />
        )}
      </View>
    );
  }

  if (currentRoutePart.type === 'map' && currentRoutePart.fullscreen) {
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
          <Marker coordinate={currentRoutePart.endpoint} title="Endpoint">
            <View style={[styles.circle, styles.redCircle]} />
          </Marker>
        </MapView>
        <TouchableOpacity onPress={centerOnCurrentLocation} style={styles.centerButton}>
          <Text style={styles.centerButtonText}>Center op huidige locatie</Text>
        </TouchableOpacity>
        {showNotification && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            style={styles.notification}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {currentRoutePart.type === 'image' && !currentRoutePart.fullscreen && (
        <Image source={defaultImage} style={styles.halfScreenImage} />
      )}
      {currentRoutePart.type === 'audio' && !currentRoutePart.fullscreen && (
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
      {region && !currentRoutePart.fullscreen && (
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
          <Marker coordinate={currentRoutePart.endpoint} title="Endpoint">
            <View style={[styles.circle, styles.redCircle]} />
          </Marker>
        </MapView>
      )}
      {!region && !currentRoutePart.fullscreen && (
        <Text>Loading...</Text>
      )}
      <TouchableOpacity onPress={centerOnCurrentLocation} style={styles.centerButton}>
        <Text style={styles.centerButtonText}>Center op huidige locatie</Text>
      </TouchableOpacity>
      {showNotification && (
        <FinishRoutePartNotification
          message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
          onNextPart={handleNextPart}
          style={styles.notification}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfScreenImage: {
    width: '100%',
    height: '50%',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  halfScreenAudio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfScreenMap: {
    width: '100%',
    height: '50%',
  },
  fullScreenMap: {
    width: '100%',
    height: '100%',
  },
  circle: {
    width: dynamicBorderRadius,
    height: dynamicBorderRadius,
    borderRadius: dynamicBorderRadius,
  },
  blueCircle: {
    backgroundColor: 'blue',
  },
  redCircle: {
    backgroundColor: 'red',
  },
  audioPlayerContainer: {
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    margin: 5,
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  centerButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -75 }],
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  centerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  notification: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -50 }],
    width: 300,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 5,
  },
});

export default HikePage;
