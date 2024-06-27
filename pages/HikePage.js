/*
The HikePage is designed for guiding users through a hiking route using a mobile app. It integrates features such as:

Real-time Location Tracking: Monitors the user's current location on a map.
Route Parts Navigation: Allows users to navigate through different parts of the route.
Multimedia Integration: Supports images and audio for enhancing the hiking experience.
Interactive Notifications: Notifies users upon reaching certain milestones (e.g., halfway point or route completion).
User Controls: Provides controls for audio playback (play, pause, rewind, fast forward) and interaction with route components.
*/

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

const routeParts = [ //Routepart data used to display the routeparts
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
  const [currentPosition, setCurrentPosition] = useState(null); // User's current latitude and longitude
  const [region, setRegion] = useState(null); // Current map region
  const [currentRoutePartIndex, setCurrentRoutePartIndex] = useState(0); // Current index of the route part
  const [sound, setSound] = useState(null); // Audio sound object
  const [isPlaying, setIsPlaying] = useState(false); // Whether audio is playing or not
  const [showNotification, setShowNotification] = useState(false); // Whether to show a notification
  const [routeCompleted, setRouteCompleted] = useState(false); // Whether the entire route is completed
  const [routePartEndNotificationShown, setRoutePartEndNotificationShown] = useState(false); // Whether the end notification for a route part has been shown
  const [initialCentered, setInitialCentered] = useState(false); // Whether the map is initially centered on the user's location
  const [audioStatus, setAudioStatus] = useState({ position: 0, duration: 0 }); // Audio playback status (position and duration)
  const [initialDistance, setInitialDistance] = useState(null); // Initial distance to the endpoint of the current route part
  const [halfwayNotificationShown, setHalfwayNotificationShown] = useState(false); // Whether the halfway notification has been shown
  const currentRoutePart = routeParts[currentRoutePartIndex]; // Get the current route part based on the currentRoutePartIndex


  useEffect(() => {
    /*
    This async function requests location permissions, fetches the user's current location, and sets the currentPosition and region states.
    It also calculates the initial distance to the endpoint of the current route part.
    */
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

    /*
    Sets up a location watcher using Location.watchPositionAsync to monitor the user's location changes in real-time.
    It updates the currentPosition state and calculates the distance to the endpoint, showing notifications if necessary.
    */
    const setupLocationWatcher = async () => {
      try {
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 15000, //The interval used to check the user's location
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

    /*
    This async function calls getCurrentLocation and setupLocationWatcher to set up the initial location tracking and monitoring. 
    It also loads the audio for the first route part if it is of type 'audio'.
    */
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
    if (currentRoutePart && currentRoutePart.type === 'audio') {  // Loads the audio file for the current route part if it is of type 'audio'. It sets the sound state and updates the audio status during playback.
      const loadAudio = async () => {
        const { sound } = await Audio.Sound.createAsync({ uri: currentRoutePart.audioUrl });
        setSound(sound);
        sound.setOnPlaybackStatusUpdate(updateAudioStatus);
      };
      loadAudio();
    }
  }, [currentRoutePart]);

  const playPauseAudio = async () => { //This async function toggles audio playback between play and pause states. It updates the isPlaying state accordingly.
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopAudio = async () => { //This async function stops the audio playback if it is currently playing.
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSliderValueChange = async (value) => { //This async function updates the audio playback position based on the slider value.
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const updateAudioStatus = (status) => { //This function updates the audioStatus state with the current position and duration of the audio playback.
    if (status.isLoaded) {
      setAudioStatus({
        position: status.positionMillis,
        duration: status.durationMillis,
      });
    }
  };

  const handleDismissNotification = () => { //This function handles the dismissal of the end notification for a route part, marking the route part as completed.
    setShowNotification(false);
    setRoutePartEndNotificationShown(true);
    routeParts[currentRoutePartIndex].completed = true;
  };

  const handleDismissHalfwayNotification = () => { //This function handles the dismissal of the halfway notification, clearing the screen for the user.
    setShowNotification(false);
    setHalfwayNotificationShown(false);
  };

  const rewindAudio = async () => { //This async function rewinds the audio playback by 10 seconds.
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.max(0, status.positionMillis - 10000);
      await sound.setPositionAsync(newPosition);
    }
  };

  const fastForwardAudio = async () => { //This async function fast-forwards the audio playback by 10 seconds.
    if (sound) {
      const status = await sound.getStatusAsync();
      const newPosition = Math.min(status.durationMillis, status.positionMillis + 10000);
      await sound.setPositionAsync(newPosition);
    }
  };

  const handleNextPart = () => { //Cleans up the state and increases the current routepart index
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

  const handlePreviousPart = () => { //Cleans up the state and decreases the current routepart index
    if (currentRoutePartIndex > 0) {
      setCurrentRoutePartIndex((prevIndex) => prevIndex - 1);
    }
    stopAudio();
    setRoutePartEndNotificationShown(false);
    setHalfwayNotificationShown(false);
  };

  const centerOnCurrentLocation = () => { //This function centers the map on the user's current location by updating the region state.
    if (currentPosition) {
      setRegion({
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  if (routeCompleted) { //When the route is completed this is displayed.
    return (
      <RouteCompletionComponent
        onBackToPrevious={() => {
          setRouteCompleted(false);
          setCurrentRoutePartIndex(routeParts.length - 1); // Go back to the last part of the route
        }}
      />
    );
  }

  if (currentRoutePart.type === 'image' && currentRoutePart.fullscreen) { //Image and fullscreen routepart
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

  if (currentRoutePart.type === 'audio' && currentRoutePart.fullscreen) { //Audio and fullscreen routepart
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
      {currentRoutePart.type === 'image' && !currentRoutePart.fullscreen && ( //Image and non-fullscreen routepart 
        <Image source={defaultImage} style={styles.image} />
      )}
      {currentRoutePart.type === 'audio' && !currentRoutePart.fullscreen && ( //Audio and non-fullscreen routepart
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
      {showNotification && !routePartEndNotificationShown && ( //When the routepart is completed and the route part end notification should be shown.
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