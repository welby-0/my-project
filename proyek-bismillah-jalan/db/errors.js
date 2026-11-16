// Error yang pesannya aman ditampilkan langsung ke pengguna
export class AppError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AppError';
  }
}

export function messageOf(error, fallback = 'Terjadi kesalahan. Coba lagi.') {
  return error instanceof AppError ? error.message : fallback;
}
