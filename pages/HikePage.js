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
import Ionicons from 'react-native-vector-icons/Ionicons';
import HalfwayNotification from '../components/HalfwayNotification';

const routeParts = [
  {
    type: 'image',
    fullscreen: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    radius: 25,
    endpoint: { latitude: 37.421956, longitude: -122.084040 },
    completed: false,
  },
  {
    type: 'image',
    fullscreen: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    radius: 25,
    endpoint: { latitude: 37.421956, longitude: -122.084040 },
    completed: false,
  },
  {
    type: 'audio',
    fullscreen: false,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    radius: 25,
    endpoint: { latitude: 37.421956, longitude: -122.084040 },
    completed: false,
  },
  {
    type: 'audio',
    fullscreen: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    radius: 25,
    endpoint: { latitude: 37.421956, longitude: -122.084040 },
    completed: false,
  },
  {
    type: 'map',
    fullscreen: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    radius: 25,
    endpoint: { latitude: 37.422000, longitude: -122.085000 },
    completed: false,
  },
];

const HikePage = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [region, setRegion] = useState(null);
  const [currentRoutePartIndex, setCurrentRoutePartIndex] = useState(0);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [routeCompleted, setRouteCompleted] = useState(false);
  const [routePartEndNotificationShown, setRoutePartEndNotificationShown] = useState(false);
  const [initialCentered, setInitialCentered] = useState(false);
  const [audioStatus, setAudioStatus] = useState({ position: 0, duration: 0 });
  const [initialDistance, setInitialDistance] = useState(null);
  const [halfwayNotificationShown, setHalfwayNotificationShown] = useState(false);

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

        const initialDist = LocationUtils.calculateDistance(
          latitude,
          longitude,
          currentRoutePart.endpoint.latitude,
          currentRoutePart.endpoint.longitude
        );
        setInitialDistance(initialDist);
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
              } else if (distance <= initialDistance / 2 && !halfwayNotificationShown) {
                console.log('User is halfway to the endpoint');
                setHalfwayNotificationShown(true);
                setShowNotification(true);
              }
            } else {
              console.log('Error fetching route part');
            }
          }
        );
        if (!initialCentered) {
          setRegion({ latitude, longitude });
          setInitialCentered(true);
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
    setRoutePartEndNotificationShown(true);
    routeParts[currentRoutePartIndex].completed = true;
  };

  const handleDismissHalfwayNotification = () => {
    setShowNotification(false);
    setHalfwayNotificationShown(false);
  };

  const rewindAudio = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.max(0, status.positionMillis - 10000);
      await sound.setPositionAsync(newPosition);
    }
  };

  const fastForwardAudio = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.min(status.durationMillis, status.positionMillis + 10000);
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
    setRoutePartEndNotificationShown(false);
    setHalfwayNotificationShown(false);
    routeParts[currentRoutePartIndex].completed = true;
  };

  const handlePreviousPart = () => {
    if (currentRoutePartIndex > 0) {
      setCurrentRoutePartIndex((prevIndex) => prevIndex - 1);
    }
    stopAudio();
    setRoutePartEndNotificationShown(false);
    setHalfwayNotificationShown(false);
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
      <RouteCompletionComponent
        onBackToPrevious={() => {
          setRouteCompleted(false);
          setCurrentRoutePartIndex(routeParts.length - 1); // Go back to the last part of the route
        }}
      />
    );
  }

  if (currentRoutePart.type === 'image' && currentRoutePart.fullscreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <CustomHeader
          title="Hike"
          onNext={handleNextPart}
          onPrevious={handlePreviousPart}
          canProceedToNext={routeParts[currentRoutePartIndex].completed}
          backToLogin={stopAudio}
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
        {showNotification && halfwayNotificationShown && (
          <HalfwayNotification
            message="Je bent halverwege het eindpunt!"
            onDismiss={handleDismissHalfwayNotification}
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
            backToLogin={stopAudio}
          />
        </View>
        <View style={styles.audioContainer}>
          <TouchableOpacity onPress={playPauseAudio}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={64} color="black" />
          </TouchableOpacity>
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={0}
            maximumValue={audioStatus.duration}
            value={audioStatus.position}
            onSlidingComplete={handleSliderValueChange}
          />
          <View style={styles.timeContainer}>
            <Text>{Math.floor(audioStatus.position / 1000)} s</Text>
            <Text>{Math.floor(audioStatus.duration / 1000)} s</Text>
          </View>
          <View style={styles.audioControlContainerFullScreen}>
            <TouchableOpacity onPress={rewindAudio}>
              <Ionicons name="play-back" size={32} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={fastForwardAudio}>
              <Ionicons name="play-forward" size={32} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        {showNotification && !routePartEndNotificationShown && (
          <FinishRoutePartNotification
            message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
            onNextPart={handleNextPart}
            onDismiss={handleDismissNotification}
            style={styles.notification}
          />
        )}
        {showNotification && halfwayNotificationShown && (
          <HalfwayNotification
            message="Je bent halverwege het eindpunt!"
            onDismiss={handleDismissHalfwayNotification}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title="Hike"
        onNext={handleNextPart}
        onPrevious={handlePreviousPart}
        canProceedToNext={routeParts[currentRoutePartIndex].completed}
        backToLogin={stopAudio}
      />
      <MapView style={{ flex: 1 }} region={region} showsUserLocation>
        {(
          <Marker coordinate={currentRoutePart.endpoint} title="Endpoint" description="Eindpunt van dit deel" pinColor="red" />
        )}
      </MapView>
      {currentRoutePart.type === 'text' && (
        <View style={styles.textContainer}>
          <Text>{currentRoutePart.text}</Text>
        </View>
      )}
      {currentRoutePart.type === 'image' && !currentRoutePart.fullscreen && (
        <Image source={defaultImage} style={styles.image} />
      )}
      {currentRoutePart.type === 'audio' && !currentRoutePart.fullscreen && (
        <View style={styles.audioContainer}>
          <TouchableOpacity onPress={playPauseAudio}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={64} color="black" />
          </TouchableOpacity>
          <Slider
            style={{ width: 200, height: 40 }}
            minimumValue={0}
            maximumValue={audioStatus.duration}
            value={audioStatus.position}
            onSlidingComplete={handleSliderValueChange}
          />
          <View style={styles.timeContainer}>
            <Text>{Math.floor(audioStatus.position / 1000)} s</Text>
            <Text>{Math.floor(audioStatus.duration / 1000)} s</Text>
          </View>
          <View style={styles.audioControlContainer}>
            <TouchableOpacity onPress={rewindAudio}>
              <Ionicons name="play-back" size={32} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={fastForwardAudio}>
              <Ionicons name="play-forward" size={32} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {showNotification && !routePartEndNotificationShown && (
        <FinishRoutePartNotification
          message="Je hebt het eindpunt van dit deel van de route bereikt. Wil je doorgaan naar het volgende deel?"
          onNextPart={handleNextPart}
          onDismiss={handleDismissNotification}
          style={styles.notification}
        />
      )}
      {showNotification && halfwayNotificationShown && (
        <HalfwayNotification
          message="Je bent halverwege het eindpunt!"
          onDismiss={handleDismissHalfwayNotification}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '91%',
    resizeMode: 'contain',
  },
  textContainer: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: '50%',
    resizeMode: 'contain',
  },
  audioContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  audioControlContainerFullScreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    marginRight: 80 
  },
  slider: {
    width: '80%',
    height: 40,
  },
  fullScreenSlider: {
    width: '90%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  notification: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  audioControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
});

export default HikePage;