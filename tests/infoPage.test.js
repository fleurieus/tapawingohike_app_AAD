import React from 'react';
import renderer from 'react-test-renderer';
import InfoPage from '../pages/InfoPage'; // Adjust the import path as per your project structure

// Mock navigation prop
const mockNavigation = {
  navigate: jest.fn(),
};

describe('<InfoPage />', () => {
  it('renders correctly', () => {
    const component = renderer.create(<InfoPage navigation={mockNavigation} />);
    const tree = component.toJSON();

    // Assert if the component renders correctly
    expect(tree).toMatchSnapshot();

    // Check the number of children at the top level
    const topLevelChildren = tree.children[0].children;
    expect(topLevelChildren.length).toBe(1); // Adjust this based on your component structure
  });
});
