import React from 'react';
import renderer from 'react-test-renderer';
import RouteCompletionComponent from '../components/RouteCompletionComponent';

// Mocking React Navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('<RouteCompletionComponent />', () => {
  it('has correct number of children', () => {
    const mockProps = {
      onBackToPrevious: jest.fn(),
    };

    const component = renderer.create(<RouteCompletionComponent {...mockProps} />);
    const tree = component.toJSON();

    // Assert the number of children
    expect(tree.children.length).toBe(201);
  });
});
