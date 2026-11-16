import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import App from '../App';

let mockFail = true;
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: async () => {
    if (mockFail) throw new Error('SQLite belum didukung di platform ini');
    return require('./helpers/sqlite-adapter').createAdapter();
  },
}));

// Di pratinjau web Snack, SQLite tidak tersedia: aplikasi harus menampilkan pesan yang jelas, bukan layar putih.
describe('database tidak tersedia', () => {
  test('menampilkan layar error dengan tombol Coba lagi, lalu pulih', async () => {
    render(React.createElement(App));
    expect(await screen.findByText('Database belum bisa dibuka', {}, { timeout: 10000 })).toBeTruthy();
    expect(screen.getByText('SQLite belum didukung di platform ini')).toBeTruthy();

    mockFail = false;
    fireEvent.press(screen.getByText('Coba lagi'));
    expect(await screen.findByText('Selamat datang di PASARIN', {}, { timeout: 15000 })).toBeTruthy();
  });
});
