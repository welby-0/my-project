// Format angka, tanggal, dan teks ala Indonesia (tanpa Intl agar konsisten di semua mesin JS)

export function rupiah(value) {
  const n = Math.round(Number(value) || 0);
  const sign = n < 0 ? '-' : '';
  return sign + 'Rp' + Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function compactCount(value) {
  const n = Number(value) || 0;
  if (n >= 1000000) return trim(n / 1000000) + ' jt';
  if (n >= 1000) return trim(n / 1000) + ' rb';
  return String(n);
}
function trim(x) {
  return (Math.round(x * 10) / 10).toString().replace('.', ',');
}

export function ratingLabel(avg) {
  return (Number(avg) || 0).toFixed(1).replace('.', ',');
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

// SQLite menyimpan datetime('now') sebagai "YYYY-MM-DD HH:MM:SS" (UTC)
function parseDbDate(value) {
  if (!value) return new Date(NaN);
  return new Date(String(value).replace(' ', 'T') + (String(value).includes('Z') ? '' : 'Z'));
}

export function formatDate(value) {
  const d = parseDbDate(value);
  if (Number.isNaN(d.getTime())) return '-';
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(value) {
  const d = parseDbDate(value);
  if (Number.isNaN(d.getTime())) return '-';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(value)}, ${hh}.${mm}`;
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
