import React from 'react';
import renderer from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';

// Mocking the Sound module from expo-av
jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => ({
        sound: { unloadAsync: jest.fn(), playAsync: jest.fn() }
      }))
    }
  }
}));

// Import the component to be tested
import HalfwayNotification from '../components/HalfwayNotification';

describe('<HalfwayNotification />', () => {
  it('renders correctly', async () => {
    // Mock the onDismiss function
    const mockOnDismiss = jest.fn();

    // Create a test renderer
    const tree = renderer.create(
      <HalfwayNotification message="Halfway there!" onDismiss={mockOnDismiss} />
    );

    // Test initial render
    let root = tree.root;

    // Find the TouchableOpacity component for the dismiss button
    const dismissButton = root.findByType(TouchableOpacity);

    // Simulate press on the dismiss button
    dismissButton.props.onPress();

    // Assert onDismiss was called once
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);

    // Cleanup mock Sound unloadAsync
    await tree.unmount();

  });
});
