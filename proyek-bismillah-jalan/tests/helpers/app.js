import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import App from '../../App';
import { DEMO_ACCOUNT } from '../../utils/constants';

export const WAIT = { timeout: 15000 };

export async function renderApp() {
  render(<App />);
  await screen.findByText('Selamat datang di PASARIN', {}, WAIT);
}

export async function loginDemo() {
  fireEvent.press(screen.getByTestId('login-demo'));
  await screen.findByText('Produk untukmu', {}, WAIT);
}

export async function loginWith(identifier, password) {
  fireEvent.changeText(screen.getByTestId('login-identifier'), identifier);
  fireEvent.changeText(screen.getByTestId('login-password'), password);
  fireEvent.press(screen.getByTestId('login-submit'));
}

export { screen, fireEvent, waitFor, act, DEMO_ACCOUNT };
