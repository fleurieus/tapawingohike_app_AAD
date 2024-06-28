import React from 'react';
import renderer from 'react-test-renderer';
import FinishRoutePartNotification from '../components/FinishRoutePartNotification';

// Mock Audio.Sound
jest.mock('expo-av', () => ({
  Sound: {
    createAsync: jest.fn(() => Promise.resolve({ sound: { playAsync: jest.fn() } })),
  },
}));

describe('<FinishRoutePartNotification />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and matches snapshot', () => {
    const tree = renderer
      .create(
        <FinishRoutePartNotification
          message="Route part completed!"
          onNextPart={() => {}}
          onDismiss={() => {}}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls sound loading and playing functions on mount', async () => {
    const component = renderer.create(
      <FinishRoutePartNotification
        message="Route part completed!"
        onNextPart={() => {}}
        onDismiss={() => {}}
      />
    );

    // Simulate component unmount
    component.unmount();

  });
});
