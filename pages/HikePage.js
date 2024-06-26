import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import LocationUtils from '../utils/LocationUtils.js';
import defaultImage from '../assets/tapaicon.png';
import FinishRoutePartNotification from '../components/FinishRoutePartNotification';
import RouteCompletionComponent from '../components/RouteCompletionComponent';
import CustomHeader from '../components/CustomHeader';
import Slider from '@react-native-community/slider';

const routeParts = [
  {
    type: 'image',
    fullscreen: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    radius: 25,
    endpoint: { latitude: 37.421956, longitude: -122.084040 },
    completed: false
  },
  // {
  //   type: 'image',
  //   fullscreen: true,
  //   audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  //   radius: 25,
  //   endpoint: { latitude: 37.421956, longitude: -122.084040 },
  //   completed: false
  // },
  // {
  //   type: 'audio',
  //   fullscreen: false,
  //   audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  //   radius: 25,
  //   endpoint: { latitude: 37.422000, longitude: -122.085000 },
  //   completed: false
  // },
  // {
  //   type: 'audio',
  //   fullscreen: true,
  //   audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  //   radius: 25,
  //   endpoint: { latitude: 37.422000, longitude: -122.085000 },
  //   completed: false
  // },
  // {
  //   type: 'map',
  //   fullscreen: false,
  //   audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  //   radius: 25,
  //   endpoint: { latitude: 37.422000, longitude: -122.085000 },
  //   completed: false
  // },
  // {
  //   type: 'map',
  //   fullscreen: true,
  //   audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  //   radius: 25,
  //   endpoint: { latitude: 37.422000, longitude: -122.085000 },
  //   completed: false
  // },
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
  let [routePartEndNotificationShown, setRoutePartEndNotificationShown] = useState(false); // Boolean to track if notification has been shown for current route part
  let [initialCentered, setInitialCentered] = useState(false); // New state to track initial centering
  const [audioStatus, setAudioStatus] = useState({
    position: 0,
    duration: 0,
  });


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
      try {
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
                if (!routePartEndNotificationShown) {
                  setShowNotification(true);
                }
                console.log(routePartEndNotificationShown);
              }
            } else {
              console.log('Error fetching route part');
            }
          }
        );
        if (!initialCentered) {
          setRegion({ latitude, longitude });
          setInitialCentered(true); // Set initial centering done
          centerOnCurrentLocation();
        }
      } catch (error) {
        console.log('Error setting up location watcher:', error);
      }
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
        sound.setOnPlaybackStatusUpdate(updateAudioStatus);
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

  const handleSliderValueChange = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };


  const updateAudioStatus = (status) => {
    if (status.isLoaded) {
      setAudioStatus({
        position: status.positionMillis,
        duration: status.durationMillis,
      });
    }
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    setRoutePartEndNotificationShown(true)
    console.log("setting setRoutePartEndNotificaion to true");
    console.log(routePartEndNotificationShown);
    routeParts[currentRoutePartIndex].completed=true;
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
    setRoutePartEndNotificationShown(false)
    routeParts[currentRoutePartIndex].completed=true;
  };

  const handlePreviousPart = () => {
    if (currentRoutePartIndex > 0) {
      setCurrentRoutePartIndex((prevIndex) => prevIndex - 1);
    }
    stopAudio();
    setRoutePartEndNotificationShown(false)
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
    return (
      <View style={{ flex: 1 }}>
        <RouteCompletionComponent
          onBackToPrevious={() => {
            setRouteCompleted(false);
            setCurrentRoutePartIndex(routeParts.length - 1); // Go back to the last part of the route
          }}
        />
      </View>
    );
  }


  if (!currentRoutePart) {
    return <Text>Loading...</Text>;
  }

  if (currentRoutePart.type === 'image' && currentRoutePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <CustomHeader
        title="Hike"
        onNext={handleNextPart}
        onPrevious={handlePreviousPart}
        canProceedToNext={routeParts[currentRoutePartIndex].completed}
      />
        <Image source={defaultImage} style={styles.fullScreenImage} />
        {showNotification && !routePartEndNotificationShown && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            onDismiss={handleDismissNotification}
            style={styles.notification}
          />
        )}

      </View>
    );
  }

  if (currentRoutePart.type === 'audio' && currentRoutePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
         <View style={styles.headerContainer}>
        <CustomHeader
          title="Hike"
          onNext={handleNextPart}
          onPrevious={handlePreviousPart}
          canProceedToNext={routeParts[currentRoutePartIndex].completed}
        />
      </View>
      <View style={styles.audioPlayerContainer}>
        <Text>Playing Audio...</Text>
        <TouchableOpacity onPress={playPauseAudio} style={styles.controlButton}>
          <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={rewindAudio} style={styles.controlButton}>
          <Text>Rewind</Text>
        </TouchableOpacity>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={0}
          maximumValue={audioStatus.duration}
          value={audioStatus.position}
          onSlidingComplete={handleSliderValueChange}
        />
        <Text>
          {Math.floor(audioStatus.position / 1000)} / {Math.floor(audioStatus.duration / 1000)} seconds
        </Text>
      </View>
        {showNotification && !routePartEndNotificationShown && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            onDismiss={handleDismissNotification}
            style={styles.notification}
          />
        )}
      </View>
    );
  }

  if (currentRoutePart.type === 'map' && currentRoutePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.headerContainer}>
        <CustomHeader
          title="Hike"
          onNext={handleNextPart}
          onPrevious={handlePreviousPart}
          canProceedToNext={routeParts[currentRoutePartIndex].completed}
        />
      </View>
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
          <Text style={styles.centerButtonText}>Center</Text>
        </TouchableOpacity>
        {showNotification && !routePartEndNotificationShown && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            onDismiss={handleDismissNotification}
            style={styles.notification}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Hike"
        onNext={handleNextPart}
        onPrevious={handlePreviousPart}
        canProceedToNext={routeParts[currentRoutePartIndex].completed}
      />
      {currentRoutePart.type === 'image' && !currentRoutePart.fullscreen && (
        <Image source={defaultImage} style={styles.halfScreenImage} />
      )}
      {currentRoutePart.type === 'audio' && !currentRoutePart.fullscreen && (
        <View style={styles.audioPlayerContainer}>
        <Text>Playing Audio...</Text>
        <TouchableOpacity onPress={playPauseAudio} style={styles.controlButton}>
          <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={rewindAudio} style={styles.controlButton}>
          <Text>Rewind</Text>
        </TouchableOpacity>
        <Slider
          style={{ width: 200, height: 40 }}
          minimumValue={0}
          maximumValue={audioStatus.duration}
          value={audioStatus.position}
          onSlidingComplete={handleSliderValueChange}
        />
        <Text>
          {Math.floor(audioStatus.position / 1000)} / {Math.floor(audioStatus.duration / 1000)} seconds
        </Text>
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
        <Text style={styles.centerButtonText}>Center</Text>
      </TouchableOpacity>
      {showNotification && !routePartEndNotificationShown && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            onDismiss={handleDismissNotification}
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  halfScreenImage: {
    width: '100%',
    height: '50%',
  },
  fullScreenImage: {
    width: '100%',
    height: '50%',
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
    height: '90%',
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
    marginLeft: 50
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
  controlButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  notification: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});

export default HikePage;
