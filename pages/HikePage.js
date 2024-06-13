import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const HikePage = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const endpoint = { latitude: 37.78825, longitude: -122.4324 };

  useEffect(() => {
    // Mocking the current location for testing
    const mockCurrentPosition = { latitude: 37.7885, longitude: -122.4326 };
    setCurrentPosition(mockCurrentPosition);
  }, []);

  return (
    <View style={styles.container}>
      {currentPosition ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Current location marker */}
          <Marker coordinate={currentPosition} title="Current Location">
            <View style={[styles.circle, styles.blueCircle]} />
          </Marker>

          {/* Endpoint marker */}
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
  map: {
    ...StyleSheet.absoluteFillObject,
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
