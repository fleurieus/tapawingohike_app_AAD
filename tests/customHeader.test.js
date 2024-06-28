import React from 'react';
import renderer from 'react-test-renderer';
import CustomHeader from '../components/CustomHeader';

// Mocking React Navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    name: 'Hike', // Mocking route name as 'Hike' for testing
  }),
}));

describe('<CustomHeader />', () => {
  it('has correct number of children', () => {
    const mockProps = {
      title: 'Hike Route',
      onNext: jest.fn(),
      onPrevious: jest.fn(),
      canProceedToNext: true,
      backToLogin: jest.fn(),
    };

    const component = renderer.create(<CustomHeader {...mockProps} />);
    const tree = component.toJSON();

    // Assert the number of children
    expect(tree.children.length).toBe(3); // Adjust this based on your component structure
  });
});
