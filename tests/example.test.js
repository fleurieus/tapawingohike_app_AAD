// Header.test.js

import React from 'react';
import { render } from '@testing-library/react-native';
import Header from './Header';

describe('Header component', () => {
  test('renders correctly', () => {
    const { getByTestId, getByText } = render(<Header />);

    // Check if logo image is rendered
    const logoImage = getByTestId('logo-image');
    expect(logoImage).toBeTruthy();

    // Check if title and subtitle are rendered with correct content
    const title = getByText('Tapawingo');
    expect(title).toBeTruthy();

    const subtitle = getByText('Hike app');
    expect(subtitle).toBeTruthy();
  });
});
