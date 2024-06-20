import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import LocationUtils from '../utils/LocationUtils.js';
import defaultImage from '../assets/tapaicon.png';
import FinishRoutePartNotification from '../components/FinishRoutePartNotification';

const mockGetRouteParts = () => {
  return [
    {
      type: 'image',
      fullscreen: false,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      radius: 25,
      endpoint: { latitude: 37.421956, longitude: -122.084040 },
    },
    {
      type: 'audio',
      fullscreen: false,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      radius: 25,
      endpoint: { latitude: 37.422000, longitude: -122.085000 },
    },
  ];
};

const HikePage = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [region, setRegion] = useState(null);
  const [routeParts, setRouteParts] = useState([]);
  const [currentRoutePartIndex, setCurrentRoutePartIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

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
          timeInterval: 5000,
          distanceInterval: 0, // Disable distance-based updates
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

          if (currentRoutePart) {
            const distance = LocationUtils.calculateDistance(latitude, longitude, currentRoutePart.endpoint.latitude, currentRoutePart.endpoint.longitude);
            console.log('Distance to endpoint in meters:', distance);

            if (distance <= currentRoutePart.radius) {
              console.log('Destination reached, showing notification');
              setShowNotification(true);
            }
          } else {
            console.log("Error: No current route part");
          }
        }
      );
    };

    const fetchRouteParts = async () => {
      try {
        const response = await mockGetRouteParts();
        setRouteParts(response);
        if (response.length > 0 && response[0].type === 'audio') {
          const { sound } = await Audio.Sound.createAsync({ uri: response[0].audioUrl });
          setSound(sound);
        }
      } catch (error) {
        console.error('Error fetching route parts:', error);
      } finally {
        setIsLoading(false); // Set loading state to false after fetching
      }
    };

    const initialize = async () => {
      await getCurrentLocation();
      await fetchRouteParts();
      await setupLocationWatcher();
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

  const rewindAudio = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.max(0, status.positionMillis - 10000); // Rewind 10 seconds
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleNextPart = () => {
    console.log('Proceeding to the next part of the route');
    setShowNotification(false);
    setCurrentRoutePartIndex((prevIndex) => prevIndex + 1);
  };

  if (isLoading) { // Check isLoading state to show loading indicator
    return <Text>Loading...</Text>;
  }

  if (routeParts.length === 0) {
    return <Text>Error: No route parts available.</Text>;
  }

  if (currentRoutePart.type === 'image' && currentRoutePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <Image source={defaultImage} style={styles.fullScreenImage} />
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
        {showNotification && (
          <FinishRoutePartNotification
            message="You have reached the endpoint of this part of the route. Do you want to proceed to the next part?"
            onNextPart={handleNextPart}
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
      {showNotification && (
        <FinishRoutePartNotification
          message="You have reached the endpoint of this part of the route. Do you want to proceed to the next part?"
          onNextPart={handleNextPart}
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
});

export default HikePage;

