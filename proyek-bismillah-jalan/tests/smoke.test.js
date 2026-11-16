import { renderApp, loginDemo, loginWith, screen, fireEvent, waitFor, WAIT } from './helpers/app';

describe('aplikasi PASARIN (render layar sungguhan)', () => {
  test('memuat database lalu menampilkan layar Masuk', async () => {
    await renderApp();
    expect(screen.getByText('Masuk')).toBeTruthy();
    expect(screen.getByTestId('login-guest')).toBeTruthy();
  });

  test('validasi form Masuk & sandi salah', async () => {
    await renderApp();
    fireEvent.press(screen.getByTestId('login-submit'));
    expect(await screen.findByText('Isi email atau nomor HP')).toBeTruthy();
    expect(screen.getByText('Isi kata sandi')).toBeTruthy();
    loginWith('demo@pasarin.id', 'salah-banget');
    expect(await screen.findByText('Email/No. HP atau kata sandi salah.', {}, WAIT)).toBeTruthy();
  });

  test('masuk dengan akun demo membuka beranda dengan produk', async () => {
    await renderApp();
    await loginDemo();
    expect(screen.getByTestId('home-search')).toBeTruthy();
    await waitFor(() => expect(screen.getAllByTestId(/^product-card-/).length).toBeGreaterThan(3), WAIT);
  });
});
